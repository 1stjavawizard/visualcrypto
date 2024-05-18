"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const AWS = require('aws-sdk');
const axios = require('axios');
// Initialize DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient();
exports.handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request event:', event);
    let response;
    try {
        const data = yield downloadAllData();
        // Save the data to DynamoDB
        yield saveDataToDynamoDB(data);
        // Extract required fields and return response with CORS headers
        response = buildResponse(200, data);
    }
    catch (error) {
        // Handle errors
        console.error('Error in handler:', error);
        if (error.message === 'HTTP Error: Blocked') {
            response = buildResponse(403, { message: 'Access to the API is blocked.' });
        }
        else {
            response = buildResponse(500, { message: 'Error fetching data from external API', error: error.message });
        }
    }
    return response;
});
// Function to download data for all coins
function downloadAllData() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://min-api.cryptocompare.com/data/v2/news/?lang=EN&api_key=98c2315a85bd1ed2657e8426f03afc6359bb9cb3b434f1696dae5eccc97c3ec9";
        try {
            const response = yield axios.get(url);
            return response.data;
        }
        catch (error) {
            console.error('Failed to download all data:', error);
            throw new Error('Failed to fetch all data');
        }
    });
}
// Function to save data to DynamoDB
function saveDataToDynamoDB(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Assuming 'articles' is the table name in DynamoDB
            const params = {
                TableName: 'articles',
                Item: {
                    id: Date.now().toString(), // Generate a unique ID (you may use a different method)
                    data: data // Save the entire data object
                }
            };
            yield dynamodb.put(params).promise();
            console.log('Data saved to DynamoDB:', data);
        }
        catch (error) {
            console.error('Failed to save data to DynamoDB:', error);
            throw new Error('Failed to save data to DynamoDB');
        }
    });
}
function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*', // Allow requests from any origin
        },
        body: JSON.stringify(body)
    };
}
