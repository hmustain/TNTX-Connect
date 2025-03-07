const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();

// Load vendor data into memory when the server starts
const vendorDataPath = path.join(__dirname, "../data/vendors.json");
let vendorMap = {};

fs.readFile(vendorDataPath, "utf8", (err, data) => {
  if (err) {
    console.error("Error loading vendor data:", err);
  } else {
    try {
      const vendors = JSON.parse(data);
      if (typeof vendors !== "object") {
        throw new Error("Vendors data is not an object! Check the JSON format.");
      }
      vendorMap = vendors; // ✅ Directly store the object
      console.log("✅ Vendor data loaded successfully.");
    } catch (parseError) {
      console.error("Error parsing vendor JSON:", parseError);
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
                    <ams:Status>OPEN</ams:Status>  <!-- ✅ Only fetch OPEN orders -->
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

    // Extract only required fields
    let filteredOrders = jsonResponse["s:Envelope"]?.["s:Body"]?.["OrderListingResMessage"]?.["Result"]?.["Orders"]?.["OrderParam"] || [];

    filteredOrders = filteredOrders.map(order => {
        // Lookup vendor details using the vendor code
        const vendorDetails = vendorMap[order.Vendor] || { name: "Unknown Vendor", phone: "N/A", city: "N/A", state: "N/A" };

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
            customerID: order.CustID,
            customerName: order.CustomerNumber,
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
