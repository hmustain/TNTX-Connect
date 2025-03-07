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

// NEW Endpoint: Test Unit Details for a single unit (UnitNumber: "13804")
router.get("/unit-details", async (req, res) => {
  try {
    const parameters = { UnitNumber: "13804", Status: "ACTIVE" };
    const units = await fetchUnitDetails(parameters);
    console.log("Fetched unit details:", JSON.stringify(units, null, 2));
    
    // If units is not an array, wrap it in one.
    const unitsArray = Array.isArray(units) ? units : (units ? [units] : []);
    // Return the first unit if available.
    const unitData = unitsArray.length ? unitsArray[0] : {};
    res.json(unitData);
  } catch (error) {
    console.error("Error fetching unit details:", error.message);
    res.status(500).json({ error: "Failed to fetch unit details" });
  }
});

// Existing Endpoint: Repair Orders with merged unit details
router.get("/repair-orders", async (req, res) => {
    try {
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
  
      if (process.env.NODE_ENV === "development") {
        console.log(`Sending SOAP request for repair orders. Request length: ${soapRequest.length}`);
      }
  
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
  
      // Parse the XML response into JSON
      const parser = new xml2js.Parser({ explicitArray: false });
      let jsonResponse = await parser.parseStringPromise(response.data);
  
      // Extract repair orders from the SOAP response
      let filteredOrders = jsonResponse["s:Envelope"]?.["s:Body"]?.["OrderListingResMessage"]?.["Result"]?.["Orders"]?.["OrderParam"] || [];
      if (!Array.isArray(filteredOrders)) {
        filteredOrders = [filteredOrders];
      }
  
      // Fetch additional unit details from Trimble via trimbleUnit.js.
      const unitDetailsResponse = await fetchUnitDetails({ Status: "ACTIVE" });
      let unitsArray = [];
      if (Array.isArray(unitDetailsResponse)) {
        unitsArray = unitDetailsResponse;
      } else if (unitDetailsResponse) {
        unitsArray = [unitDetailsResponse];
      }
  
      // Build a map of unit details keyed by cleaned UnitNumber.
      let unitDetailsMap = {};
      unitsArray.forEach(unit => {
        if (unit.UnitNumber) {
          unitDetailsMap[cleanString(unit.UnitNumber)] = unit;
        }
      });
  
      // Map each repair order and merge additional unit details.
      let mappedOrders = filteredOrders.map(order => {
        // Lookup vendor details
        const vendorDetails = vendorMap[order.Vendor] || { name: "Unknown Vendor", phone: "N/A", city: "N/A", state: "N/A" };
  
        // Lookup customer details based on CustomerNumber field
        const customerKey = order.CustomerNumber ? order.CustomerNumber.trim() : "";
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
  
        // Lookup additional unit details using the unit number from the order.
        const unitKey = order.UnitNumber ? cleanString(order.UnitNumber) : "";
        const additionalUnit = unitDetailsMap[unitKey] || {};
  
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
          // Nest unit details under unitNumber
          unitNumber: {
            value: order.UnitNumber,
            details: {
              UnitNumber: additionalUnit.UnitNumber || "",
              UnitType: additionalUnit.UnitType || "",
              Make: additionalUnit.Make || "",
              Model: additionalUnit.Model || "",
              ModelYear: additionalUnit.ModelYear || "",
              SerialNo: additionalUnit.SerialNo || "",
              NameCustomer: additionalUnit.NameCustomer || ""
            }
          },
          // Attach customer details with cleanup
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
  
      // If a "fromDate" query parameter is provided, filter the orders accordingly.
      if (req.query.fromDate) {
        const fromDate = new Date(req.query.fromDate);
        mappedOrders = mappedOrders.filter(order => new Date(order.openedDate) >= fromDate);
      }
  
      res.json(mappedOrders);
    } catch (error) {
      console.error("Error fetching repair orders:", error.message);
      res.status(500).json({ error: "Failed to fetch repair orders" });
    }
  });
  

module.exports = router;
