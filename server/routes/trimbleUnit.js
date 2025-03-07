// trimbleUnit.js
const axios = require("axios");
const xml2js = require("xml2js");
require("dotenv").config();

async function parseSOAPResponse(soapResponse) {
  const parser = new xml2js.Parser({ explicitArray: false });
  return parser.parseStringPromise(soapResponse);
}

async function fetchUnitDetails(parameters = {}) {
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

    // Log the raw XML response for inspection
    // console.log("Raw SOAP response:", response.data);

    const jsonResponse = await parseSOAPResponse(response.data);
    // console.log("Parsed JSON response:", JSON.stringify(jsonResponse, null, 2));

    // Extraction: we include the "Result" node in the path.
    const unitDetailsRaw = jsonResponse["s:Envelope"]?.["s:Body"]?.["UnitDetailsListResMessage"]?.["Result"]?.["UnitList"]?.["UnitDetails"];
    if (!unitDetailsRaw) return null;

    // Transform the unit details to include only the desired fields.
    const transformUnit = (unit) => ({
      UnitNumber: unit.UnitNumber || "",
      UnitType: unit.UnitType || "",
      Make: unit.Make || "",
      Model: unit.Model || "",
      ModelYear: unit.ModelYear || "",
      SerialNo: unit.SerialNo || "",
      NameCustomer: unit.NameCustomer || ""
    });

    if (Array.isArray(unitDetailsRaw)) {
      return unitDetailsRaw.map(transformUnit);
    } else {
      return transformUnit(unitDetailsRaw);
    }
  } catch (error) {
    console.error("Error fetching unit details:", error.message);
    throw error;
  }
}

module.exports = { fetchUnitDetails };

// Test block: If run directly, fetch details for unit number "13804"
if (require.main === module) {
  (async () => {
    try {
      const result = await fetchUnitDetails({ UnitNumber: "13804", Status: "ACTIVE" });
      console.log("Test fetch result:", JSON.stringify(result, null, 2));
    } catch (err) {
      console.error("Test fetch error:", err);
    }
  })();
}
