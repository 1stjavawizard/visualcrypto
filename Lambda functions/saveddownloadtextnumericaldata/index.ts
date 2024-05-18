const AWS:any = require('aws-sdk');
const axios:any = require('axios');


// Initialize DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event: any) => {
    console.log('Request event:', event);
    let response;
    try {
        const data = await downloadAllData();

        // Save the data to DynamoDB
        await saveDataToDynamoDB(data);

        // Extract required fields and return response with CORS headers
        response = buildResponse(200, data);
    } catch (error: any) {
        // Handle errors
        console.error('Error in handler:', error);
        if (error.message === 'HTTP Error: Blocked') {
            response = buildResponse(403, { message: 'Access to the API is blocked.' });
        } else {
            response = buildResponse(500, { message: 'Error fetching data from external API', error: error.message });
        }
    }
    
    return response;
};

// Function to download data for all coins
async function downloadAllData() {
    const url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=98c2315a85bd1ed2657e8426f03afc6359bb9cb3b434f1696dae5eccc97c3ec9";
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Failed to download all data:', error);
        throw new Error('Failed to fetch all data');
    }
}

// Function to save data to DynamoDB
async function saveDataToDynamoDB(data: any) {
    try {
        // Assuming 'articles' is the table name in DynamoDB
        const params = {
            TableName: 'articles',
            Item: {
                id: Date.now().toString(), // Generate a unique ID (you may use a different method)
                data: data // Save the entire data object
            }
        };

        await dynamodb.put(params).promise();
        console.log('Data saved to DynamoDB:', data);
    } catch (error) {
        console.error('Failed to save data to DynamoDB:', error);
        throw new Error('Failed to save data to DynamoDB');
    }
}

function buildResponse(statusCode: any, body: any) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        },
        body: JSON.stringify(body)
    };
}
