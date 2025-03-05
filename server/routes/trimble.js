const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
require('dotenv').config();

const router = express.Router();

router.get('/repair-orders', async (req, res) => {
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
                    </ams:Param>
                </ams:GetOrderDetailsParamMessage>
            </soapenv:Body>
        </soapenv:Envelope>`;

        const response = await axios.post(process.env.TRIMBLE_API_URL, soapRequest, {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': 'text/xml'
            }
        });

        // Convert XML to JSON
        const parser = new xml2js.Parser({ explicitArray: false });
        const jsonResponse = await parser.parseStringPromise(response.data);

        res.json(jsonResponse);
    } catch (error) {
        console.error("Error fetching repair orders:", error.message);
        res.status(500).json({ error: "Failed to fetch repair orders" });
    }
});

module.exports = router;
