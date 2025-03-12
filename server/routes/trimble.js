// routes/trimble.js
const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { client } = require("../utils/cache"); // Redis client

// Import the fetchUnitDetails function from trimbleUnit.js
const { fetchUnitDetails } = require("./trimbleUnit");

const router = express.Router();

// Helper function to clean up strings (removes newlines and extra whitespace)
function cleanString(str) {
  if (!str) return "";
  return str.replace(/(\r\n|\n|\r)/gm, " ").trim();
}

// Helper function to normalize unit types
function normalizeUnitType(rawType) {
  if (!rawType) return "";
  const type = rawType.toLowerCase();
  if (type.includes("truck") || type.includes("tractor")) {
    return "tractor";
  } else if (type.includes("trailer") || type.includes("trl")) {
    return "trailer";
  }
  return type;
}

// Load vendor data into memory when the server starts
const vendorDataPath = path.join(__dirname, "../data/vendors.json");
let vendorMap = {};

fs.readFile(vendorDataPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error loading vendor data:", err);
  } else {
    try {
      vendorMap = JSON.parse(data);
      console.log("✅ Vendor data loaded successfully.");
    } catch (parseError) {
      console.error("Error parsing vendor JSON:", parseError);
    }
  }
});

// Load customer data into memory when the server starts
const customerDataPath = path.join(__dirname, "../data/customers.json");
let customerMap = {};

fs.readFile(customerDataPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error loading customer data:", err);
  } else {
    try {
      customerMap = JSON.parse(data);
      console.log("✅ Customer data loaded successfully.");
    } catch (parseError) {
      console.error("Error parsing customer JSON:", parseError);
    }
  }
});

/**
 * This function handles the API call to Trimble,
 * parses the SOAP XML response, and maps the orders.
 */
async function fetchOrdersFromTrimble(query = {}) {
  // Build the SOAP request for repair orders
  const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ams="http://tmwsystems.com/AMS">
          <soapenv:Header>
              <ams:UserName>${process.env.TRIMBLE_USERNAME}</ams:UserName>
              <ams:Password>${process.env.TRIMBLE_PASSWORD}</ams:Password>
          </soapenv:Header>
          <soapenv:Body>
              <ams:GetOrderDetailsParamMessage>
                  <ams:Param>
                      <ams:OrderType>6</ams:OrderType>
                      <ams:Status>OPEN</ams:Status>
                  </ams:Param>
              </ams:GetOrderDetailsParamMessage>
          </soapenv:Body>
      </soapenv:Envelope>`;

  const response = await axios.post(process.env.TRIMBLE_API_URL, soapRequest, {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "text/xml",
      SOAPAction: "http://tmwsystems.com/AMS/IIntegrationToolKit/GetOrderDetails",
    },
  });

  // Parse the XML response into JSON
  const parser = new xml2js.Parser({ explicitArray: false });
  let jsonResponse = await parser.parseStringPromise(response.data);

  // Extract repair orders from the SOAP response
  let filteredOrders =
    jsonResponse["s:Envelope"]?.["s:Body"]?.["OrderListingResMessage"]?.["Result"]?.["Orders"]?.["OrderParam"] || [];
  if (!Array.isArray(filteredOrders)) {
    filteredOrders = [filteredOrders];
  }

  // Fetch additional unit details from Trimble via trimbleUnit.js
  const unitDetailsResponse = await fetchUnitDetails({ Status: "ACTIVE" });
  let unitsArray = [];
  if (Array.isArray(unitDetailsResponse)) {
    unitsArray = unitDetailsResponse;
  } else if (unitDetailsResponse) {
    unitsArray = [unitDetailsResponse];
  }

  // Build a map of unit details keyed by cleaned UnitNumber
  let unitDetailsMap = {};
  unitsArray.forEach((unit) => {
    if (unit.UnitNumber) {
      unitDetailsMap[cleanString(unit.UnitNumber)] = unit;
    }
  });

  // Map each repair order and merge additional unit details.
  let mappedOrders = filteredOrders.map((order) => {
    const customerKey = order.CustomerNumber ? order.CustomerNumber.trim() : "";

    const vendorDetails = vendorMap[order.Vendor] || {
      name: "Unknown Vendor",
      phone: "N/A",
      city: "N/A",
      state: "N/A",
    };

    let customerDetails = customerMap[customerKey];
    if (!customerDetails) {
      customerDetails = {
        NAME: "Unknown",
        ADDRESS1: "N/A",
        CITY: "N/A",
        STATE: "N/A",
        ZIPCODE: "N/A",
        MAINPHONE: "N/A",
      };
    }

    const unitKey = order.UnitNumber ? cleanString(order.UnitNumber) : "";
    const additionalUnit = unitDetailsMap[unitKey] || {};

    // Extract RoadCall details from OrderLines if available.
    let roadCallNum = null;
    let roadCallId = null;
    if (order.Sections?.OrderSectionRes?.OrderLines?.OrderLineRes) {
      const orderLines = Array.isArray(order.Sections.OrderSectionRes.OrderLines.OrderLineRes)
        ? order.Sections.OrderSectionRes.OrderLines.OrderLineRes
        : [order.Sections.OrderSectionRes.OrderLines.OrderLineRes];
      orderLines.forEach((line) => {
        if (line.LineType === "COMMENT" && line.Description.includes("RC")) {
          const match = line.Description.match(/RC(\d+)\s*\/\s*(\d+)/);
          if (match) {
            roadCallNum = `RC${match[1]}`; // Prepend "RC" to the number
            roadCallId = match[2];
          }
        }
      });
    }

    // Fallback to any existing RepOrder values if extraction did not yield results.
    roadCallId = roadCallId || order.RepOrder?.RoadCallId || null;
    roadCallNum = roadCallNum || order.RepOrder?.RoadCallNum || null;

    return {
      orderId: order.OrderID,
      orderNumber: order.OrderNum,
      status: order.Status,
      openedDate: order.Opened,
      closedDate: order.Closed || null,
      vendor: {
        code: order.Vendor,
        name: vendorDetails.name,
        phone: vendorDetails.phone,
        city: vendorDetails.city,
        state: vendorDetails.state,
      },
      unitNumber: {
        value: order.UnitNumber,
        details: {
          UnitNumber: additionalUnit.UnitNumber || "",
          UnitType: normalizeUnitType(additionalUnit.UnitType),
          Make: additionalUnit.Make || "",
          Model: additionalUnit.Model || "",
          ModelYear: additionalUnit.ModelYear || "",
          SerialNo: additionalUnit.SerialNo || "",
          NameCustomer: additionalUnit.NameCustomer || "",
        },
      },
      customer: {
        key: customerKey,
        NAME: cleanString(customerDetails.NAME),
        ADDRESS1: cleanString(customerDetails.ADDRESS1),
        CITY: cleanString(customerDetails.CITY),
        STATE: cleanString(customerDetails.STATE),
        ZIPCODE: cleanString(customerDetails.ZIPCODE),
        MAINPHONE: cleanString(customerDetails.MAINPHONE),
      },
      componentCode: order.Sections?.OrderSectionRes?.CompCode || "",
      componentDescription: order.Sections?.OrderSectionRes?.CompDesc || "",
      roadCallId,
      roadCallNum,
      roadCallLink: roadCallId
        ? `https://ttx.tmwcloud.com/AMSApp/ng-ams/ams-home.aspx#/road-calls/road-call-detail/${roadCallId}`
        : null,
    };
  });

  // Apply any additional filtering passed in via the query parameter (if needed)
  if (query.fromDate) {
    const fromDate = new Date(query.fromDate);
    mappedOrders = mappedOrders.filter((order) => new Date(order.openedDate) >= fromDate);
  }

  // Filter to only include orders from allowed customers
  const allowedCustomerKeys = [
    "MELTON",
    "104376",
    "ROYAL",
    "HODGES",
    "SMT",
    "CCT",
    "BIGM",
    "WATKINS",
    "WILSON",
    "MC EXPRESS",
  ];
  mappedOrders = mappedOrders.filter((order) => allowedCustomerKeys.includes(order.customer.key));

  return mappedOrders;
}

/**
 * getMappedOrders is our caching wrapper.
 * It first checks Redis for cached data, and if none is found,
 * it calls fetchOrdersFromTrimble(), caches the result, and returns it.
 */
async function getMappedOrdersCached(query = {}) {
  const cacheKey = `orders:${JSON.stringify(query)}`;
  
  // Check for cached data
  const cachedData = await client.get(cacheKey);
  if (cachedData) {
    console.log("Returning cached orders");
    
    // Check remaining TTL (in seconds)
    const ttl = await client.ttl(cacheKey);
    // If TTL is less than a threshold (e.g., 60 seconds), trigger background revalidation.
    if (ttl < 60) {
      console.log("Cache nearing expiration (TTL:", ttl, "), revalidating in background...");
      // Trigger background fetch without awaiting its completion.
      fetchOrdersFromTrimble(query)
        .then(async (orders) => {
          await client.setEx(cacheKey, 3600, JSON.stringify(orders)); // reset TTL to 3600 sec
          console.log("Background cache update complete");
        })
        .catch((err) => {
          console.error("Error during background revalidation:", err);
        });
    }
    
    // Immediately return cached data
    return JSON.parse(cachedData);
  }
  
  // If no cached data, fetch and cache it
  const orders = await fetchOrdersFromTrimble(query);
  await client.setEx(cacheKey, 3600, JSON.stringify(orders));
  return orders;
}


// Endpoint to get all repair orders
router.get("/repair-orders", async (req, res) => {
  try {
    const orders = await getMappedOrdersCached(req.query);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching repair orders:", error.message);
    res.status(500).json({ error: "Failed to fetch repair orders" });
  }
});

// New endpoint: Get repair order by OrderID with related orders (repOrders)
router.get("/repair-orders/:orderId", async (req, res) => {
  try {
    const orderIdParam = req.params.orderId;
    const allOrders = await getMappedOrdersCached(); // Fetch all orders

    // Find the main order based on orderId
    const mainOrder = allOrders.find((o) => o.orderId === orderIdParam);
    if (!mainOrder) {
      return res.status(404).json({ error: "Repair order not found" });
    }

    // If the main order has a roadCallId, find all orders sharing it (excluding the main order)
    let relatedOrders = [];
    if (mainOrder.roadCallId) {
      relatedOrders = allOrders.filter(
        (o) =>
          o.roadCallId === mainOrder.roadCallId &&
          o.orderId !== mainOrder.orderId
      );
    }

    // Attach related orders as repOrders
    mainOrder.repOrders = relatedOrders;

    res.json(mainOrder);
  } catch (error) {
    console.error("Error fetching repair order by id:", error.message);
    res.status(500).json({ error: "Failed to fetch repair order" });
  }
});

module.exports = router;
