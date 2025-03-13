// routes/trimble.js
const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { client } = require("../utils/cache"); // Redis client
const Company = require("../models/Company"); // Import Company model

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
 * parses the SOAP XML response, maps the orders, and assigns the company.
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

  // Allowed customer keys that are valid in your system
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
    "SKY",
    "TNTXSOL"
  ];

  // Query your Company collection to build a mapping from trimbleCode to ObjectId
  const companiesFromDB = await Company.find({ trimbleCode: { $in: allowedCustomerKeys } });
  const companyMapping = {};
  companiesFromDB.forEach(comp => {
    // Use uppercase for consistency
    companyMapping[comp.trimbleCode.toUpperCase()] = comp._id.toString();
  });

  // Map each repair order, merge additional unit details, and assign company based on customer key.
  let mappedOrders = filteredOrders.map((order) => {
    // Extract customer key from either Order.CustomerNumber or order.customer.key
    const customerKey = order.CustomerNumber 
      ? order.CustomerNumber.trim() 
      : (order.customer && order.customer.key ? order.customer.key.trim() : "");

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
            roadCallNum = `RC${match[1]}`;
            roadCallId = match[2];
          }
        }
      });
    }

    roadCallId = roadCallId || order.RepOrder?.RoadCallId || null;
    roadCallNum = roadCallNum || order.RepOrder?.RoadCallNum || null;

    // Look up the internal Company ObjectId using the customer key from the order.
    const companyId = companyMapping[customerKey.toUpperCase()] || null;

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
      // Assign the company ObjectId based on the customer key
      company: companyId,
    };
  });

  // Apply any additional filtering passed in via the query parameter (if needed)
  if (query.fromDate) {
    const fromDate = new Date(query.fromDate);
    mappedOrders = mappedOrders.filter((order) => new Date(order.openedDate) >= fromDate);
  }

  // Filter to only include orders from allowed customers
  mappedOrders = mappedOrders.filter((order) => allowedCustomerKeys.includes(order.customer.key));

  return mappedOrders;
}

/**
 * getMappedOrdersCached is our caching wrapper.
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
    if (ttl < 60) {
      console.log("Cache nearing expiration (TTL:", ttl, "), revalidating in background...");
      fetchOrdersFromTrimble(query)
        .then(async (orders) => {
          await client.setEx(cacheKey, 3600, JSON.stringify(orders));
          console.log("Background cache update complete");
        })
        .catch((err) => {
          console.error("Error during background revalidation:", err);
        });
    }
    
    return JSON.parse(cachedData);
  }
  
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
    const allOrders = await getMappedOrdersCached();

    const mainOrder = allOrders.find((o) => o.orderId === orderIdParam);
    if (!mainOrder) {
      return res.status(404).json({ error: "Repair order not found" });
    }

    let relatedOrders = [];
    if (mainOrder.roadCallId) {
      relatedOrders = allOrders.filter(
        (o) =>
          o.roadCallId === mainOrder.roadCallId &&
          o.orderId !== mainOrder.orderId
      );
    }
    mainOrder.repOrders = relatedOrders;

    res.json(mainOrder);
  } catch (error) {
    console.error("Error fetching repair order by id:", error.message);
    res.status(500).json({ error: "Failed to fetch repair order" });
  }
});

module.exports = { router, getMappedOrdersCached };
