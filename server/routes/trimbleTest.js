const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
require("dotenv").config();

const router = express.Router();

// Function to fetch a specific order by Order ID (57868 for testing)
async function fetchTestOrder() {
  const soapRequest = `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ams="http://tmwsystems.com/AMS">
          <soapenv:Header>
              <ams:UserName>${process.env.TRIMBLE_USERNAME}</ams:UserName>
              <ams:Password>${process.env.TRIMBLE_PASSWORD}</ams:Password>
          </soapenv:Header>
          <soapenv:Body>
              <ams:GetOrderDetailsParamMessage>
                  <ams:Param>
                      <ams:OrderID>57868</ams:OrderID>
                  </ams:Param>
              </ams:GetOrderDetailsParamMessage>
          </soapenv:Body>
      </soapenv:Envelope>`;

  try {
    const response = await axios.post(process.env.TRIMBLE_API_URL, soapRequest, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Accept: "text/xml",
        SOAPAction: "http://tmwsystems.com/AMS/IIntegrationToolKit/GetOrderDetails",
      },
    });

    const parser = new xml2js.Parser({ explicitArray: false });
    let jsonResponse = await parser.parseStringPromise(response.data);

    let order =
      jsonResponse["s:Envelope"]?.["s:Body"]?.["OrderListingResMessage"]?.["Result"]?.["Orders"]?.["OrderParam"] || null;
    if (!order) {
      return null;
    }

    // Extract RC number from a comment line if available
    let roadCallNum = null;
    let roadCallId = null;
    if (order.Sections?.OrderSectionRes?.OrderLines?.OrderLineRes) {
      let orderLines = Array.isArray(order.Sections.OrderSectionRes.OrderLines.OrderLineRes)
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

    return {
      orderId: order.OrderID,
      orderNumber: order.OrderNum,
      status: order.Status,
      roadCallNum,
      roadCallId,
      roadCallLink: roadCallId
        ? `https://ttx.tmwcloud.com/AMSApp/ng-ams/ams-home.aspx#/road-calls/road-call-detail/${roadCallId}`
        : null,
    };
  } catch (error) {
    console.error("Error fetching Trimble test order:", error.message);
    return null;
  }
}

// Test endpoint to fetch only the specific test order (Order ID 57868)
router.get("/test-order", async (req, res) => {
  try {
    const order = await fetchTestOrder();
    if (!order) {
      return res.status(404).json({ error: "Test order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching test order:", error.message);
    res.status(500).json({ error: "Failed to fetch test order" });
  }
});

module.exports = router;