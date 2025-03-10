// routes/trimble.js
const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

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

// Function that fetches, maps, and returns repair orders
async function getMappedOrders(query = {}) {
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
  // Also include the OrderID, RoadCallId, and RoadCallNum from RepOrder (if available)
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

    return {
      orderId: order.OrderID, // Added OrderID field
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
      roadCallId: order.RepOrder?.RoadCallId || null,
      roadCallNum: order.RepOrder?.RoadCallNum || null,
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

// Endpoint to get all repair orders
router.get("/repair-orders", async (req, res) => {
  try {
    const orders = await getMappedOrders(req.query);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching repair orders:", error.message);
    res.status(500).json({ error: "Failed to fetch repair orders" });
  }
});

// New endpoint: Get repair order by OrderID
router.get("/repair-orders/:orderId", async (req, res) => {
  try {
    const orderIdParam = req.params.orderId;
    const orders = await getMappedOrders();
    // Find the order where orderId matches the parameter.
    const order = orders.find((o) => o.orderId === orderIdParam);
    if (!order) {
      return res.status(404).json({ error: "Repair order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching repair order by id:", error.message);
    res.status(500).json({ error: "Failed to fetch repair order" });
  }
});

module.exports = router;
