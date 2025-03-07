const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();

// Helper function to clean up strings (removes newlines and extra whitespace)
function cleanString(str) {
  if (!str) return "";
  return str.replace(/(\r\n|\n|\r)/gm, " ").trim();
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

router.get("/repair-orders", async (req, res) => {
  try {
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

    console.log("Sending SOAP request:\n", soapRequest);

    const response = await axios.post(
      process.env.TRIMBLE_API_URL,
      soapRequest,
      {
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          "Accept": "text/xml",
          "SOAPAction": "http://tmwsystems.com/AMS/IIntegrationToolKit/GetOrderDetails"
        }
      }
    );

    // Convert XML to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    let jsonResponse = await parser.parseStringPromise(response.data);

    // Extract orders from the XML response
    let filteredOrders = jsonResponse["s:Envelope"]?.["s:Body"]?.["OrderListingResMessage"]?.["Result"]?.["Orders"]?.["OrderParam"] || [];

    // Ensure filteredOrders is always an array
    if (!Array.isArray(filteredOrders)) {
      filteredOrders = [filteredOrders];
    }

    filteredOrders = filteredOrders.map(order => {
      // Lookup vendor details using the vendor code
      const vendorDetails = vendorMap[order.Vendor] || { name: "Unknown Vendor", phone: "N/A", city: "N/A", state: "N/A" };

      // Use the CustomerNumber field from the SOAP response (e.g., "SKY")
      const customerKey = order.CustomerNumber ? order.CustomerNumber.trim() : "";
    //   console.log(`Order ${order.OrderNum} - Customer Key: "${customerKey}"`);

      // Direct lookup in the customerMap using the customerKey
      let customerDetails = customerMap[customerKey];

      if (!customerDetails) {
        console.log(`No customer match found for key: "${customerKey}"`);
        customerDetails = {
          NAME: "Unknown",
          ADDRESS1: "N/A",
          CITY: "N/A",
          STATE: "N/A",
          ZIPCODE: "N/A",
          MAINPHONE: "N/A"
        };
      }

      return {
        orderNumber: order.OrderNum,
        status: order.Status,
        openedDate: order.Opened,
        closedDate: order.Closed || null,
        vendor: {
          code: order.Vendor,
          name: vendorDetails.name,
          phone: vendorDetails.phone,
          city: vendorDetails.city,
          state: vendorDetails.state
        },
        unitNumber: order.UnitNumber,
        // Attach the cleaned customer details
        customer: {
          NAME: cleanString(customerDetails.NAME),
          ADDRESS1: cleanString(customerDetails.ADDRESS1),
          CITY: cleanString(customerDetails.CITY),
          STATE: cleanString(customerDetails.STATE),
          ZIPCODE: cleanString(customerDetails.ZIPCODE),
          MAINPHONE: cleanString(customerDetails.MAINPHONE)
        },
        componentCode: order.Sections?.OrderSectionRes?.CompCode || "",
        componentDescription: order.Sections?.OrderSectionRes?.CompDesc || ""
      };
    });

    res.json(filteredOrders);
  } catch (error) {
    console.error("Error fetching repair orders:", error.message);
    res.status(500).json({ error: "Failed to fetch repair orders" });
  }
});

module.exports = router;
