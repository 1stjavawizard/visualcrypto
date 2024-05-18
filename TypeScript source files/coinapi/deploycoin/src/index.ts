
import axios from 'axios';


// Define the interfaces for the expected data structures
interface SingleData {
  quote_currency: string;
  base_currency: string;
}
interface ManyData { 
  articles: SingleData[];
}

// Constants for API paths
const allcoinsPath = '/allcoins';
const onecoinPath = '/onecoin';
// const onecoinPath = '/onecoin/{pair}';



// Lambda handler function
export const handler = async (event: any): Promise<any> => {
    console.log('Request event:', event);
    let response: any;

    try {
        switch (event.httpMethod) {
            case 'GET':
                switch (event.path) {
                    case onecoinPath:
                        // const pair = event.pathParameters.pair;
                        // Assume the pair is passed as a query parameter
                        const pair = event.queryStringParameters.pair;
                        response = await downloadOneData(pair);
                        break;
                    case allcoinsPath:
                        response = await downloadAllData();
                        break;
                    default:
                        response = buildResponse(404, 'Not Found');
                        break;
                }
                break;
            default:
                response = buildResponse(405, 'Method Not Allowed');
                break;
        }
    } catch (error) {
        console.error('Error processing request:', error);
        response = buildResponse(500, 'Internal Server Error');
    }

    return response;
};


// Function to download data for all coins
async function downloadAllData(): Promise<any> {
  const url = "https://api.pro.coinbase.com/products";
  try {
      const { data } = await axios.get<ManyData>(url);
      return buildResponse(200, processData(data));
  } catch (error) {
      console.error('Failed to download all data:', error);
      return buildResponse(500, 'Failed to fetch all data');
  }
}

// Function to download data for a single pair
async function downloadOneData(pair: string): Promise<any> {
  const url = `https://api.pro.coinbase.com/products/${pair}/candles?granularity=86400`;
  try {
      const { data } = await axios.get<SingleData[]>(url);
      return buildResponse(200, processData(data));
  } catch (error) {
      console.error('Failed to download data for:', pair, error);
      return buildResponse(500, 'Failed to fetch data for the specified pair');
  }
}


// Function to process data
function processData(data: ManyData | SingleData[]): any {
  // Process your data here as needed
  return data;
}

// Function to build HTTP response
function buildResponse(statusCode: number, body: any): any {
  return {
      statusCode: statusCode,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'  // Ensure CORS compatibility
      },
      body: JSON.stringify(body)
  };
}


