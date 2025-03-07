// trimbleUnit.js
const axios = require("axios");
const xml2js = require("xml2js");
require("dotenv").config();

/**
 * Helper function to parse SOAP XML responses into JSON.
 * This function uses xml2js with the option to not wrap single items in arrays.
 */
async function parseSOAPResponse(soapResponse) {
  const parser = new xml2js.Parser({ explicitArray: false });
  return parser.parseStringPromise(soapResponse);
}

/**
 * Fetches unit details from the Trimble API.
 * You can pass parameters (like UnitID, UnitNumber, CustomerName, etc.) as needed.
 *
 * The SOAP envelope is constructed to match the WSDL for the GetUnitDetails operation.
 *
 * @param {Object} parameters - An object containing optional parameters.
 * @returns {Promise<Object[]>} - A promise that resolves to the unit details.
 */
async function fetchUnitDetails(parameters = {}) {
  // Construct the SOAP envelope using the provided parameters.
  const soapRequest = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ams="http://tmwsystems.com/AMS">
      <soapenv:Header>
        <ams:UserName>${process.env.TRIMBLE_USERNAME}</ams:UserName>
        <ams:Password>${process.env.TRIMBLE_PASSWORD}</ams:Password>
      </soapenv:Header>
      <soapenv:Body>
        <ams:GetUnitDetailsParamMessage>
          <ams:Param>
            ${parameters.UnitID ? `<ams:UnitID>${parameters.UnitID}</ams:UnitID>` : ""}
            ${parameters.UnitNumber ? `<ams:UnitNumber>${parameters.UnitNumber}</ams:UnitNumber>` : ""}
            ${parameters.CustomerName ? `<ams:CustomerName>${parameters.CustomerName}</ams:CustomerName>` : ""}
            ${parameters.Status ? `<ams:Status>${parameters.Status}</ams:Status>` : "<ams:Status>ACTIVE</ams:Status>"}
            ${parameters.Make ? `<ams:Make>${parameters.Make}</ams:Make>` : ""}
            ${parameters.Model ? `<ams:Model>${parameters.Model}</ams:Model>` : ""}
            ${parameters.SerialNo ? `<ams:SerialNo>${parameters.SerialNo}</ams:SerialNo>` : ""}
          </ams:Param>
        </ams:GetUnitDetailsParamMessage>
      </soapenv:Body>
    </soapenv:Envelope>`;

  try {
    const response = await axios.post(process.env.TRIMBLE_API_URL, soapRequest, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        "Accept": "text/xml",
        "SOAPAction": "http://tmwsystems.com/AMS/IIntegrationToolKit/GetUnitDetails"
      }
    });

    const jsonResponse = await parseSOAPResponse(response.data);
    // Navigate the JSON response to extract the unit details.
    // Adjust the following path if your actual response structure is different.
    const unitDetails = jsonResponse["s:Envelope"]?.["s:Body"]?.["UnitDetailsListResMessage"]?.["UnitList"]?.["UnitDetails"];
    return unitDetails;
  } catch (error) {
    console.error("Error fetching unit details:", error.message);
    throw error;
  }
}

module.exports = { fetchUnitDetails };
