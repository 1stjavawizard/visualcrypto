const axios = require('axios');


export const handler = async (event: any) => {
    console.log('Request event:', event);
    let response: any;
    try {
        
        response = await downloadAllData();

 
        // Extract required fields and return response with CORS headers
        return buildResponse(200, response);
    } catch (error: any) {
        // Handle errors
        console.error('Error in handler:', error);
        if (error.message === 'HTTP Error: Blocked') {
            return buildResponse(403, { message: 'Access to the API is blocked.' });
        } else {
            return buildResponse(500, { message: 'Error fetching data from external API', error: error.message });
        }
    }
};

// Function to download data for all coins
async function downloadAllData(): Promise<any> {
    const url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=98c2315a85bd1ed2657e8426f03afc6359bb9cb3b434f1696dae5eccc97c3ec9";
    try {
        const response = await axios.get(url);
  
       

       

      return response.data;
    } catch (error) {
      console.error('Failed to download all data:', error);
      return buildResponse(500, 'Failed to fetch all data');
    }
  }
  


function buildResponse(statusCode: number, body: any): any {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Allow requests from any origin
          
        },
        body: JSON.stringify(body)
    };
}
