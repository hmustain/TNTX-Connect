const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
require("dotenv").config();

const router = express.Router();

// Function to escape XML special characters
const escapeXML = (str) => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .replace(/!/g, "&#33;");
};

router.get("/repair-orders", async (req, res) => {
  try {
    const startDate = "2024-03-01";  // Start from March 1
    const endDate = "2024-03-07";    // Fetch only one week
    
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
                    <ams:StartDate>${startDate}</ams:StartDate>  
                    <ams:EndDate>${endDate}</ams:EndDate>  <!-- ✅ Restrict to one week -->
                </ams:Param>
            </ams:GetOrderDetailsParamMessage>
        </soapenv:Body>
    </soapenv:Envelope>`;
    // Log full SOAP request to debug issues
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
    const jsonResponse = await parser.parseStringPromise(response.data);

    res.json(jsonResponse);
  } catch (error) {  // ✅ This catch block was missing
    console.error("Error fetching repair orders:", error.message);
    res.status(500).json({ error: "Failed to fetch repair orders" });
  }
});

module.exports = router;
