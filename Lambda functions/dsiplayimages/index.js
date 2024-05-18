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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios = require('axios');
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request event:', event);
    let response;
    try {
        response = yield downloadAllData();
        // Extract required fields and return response with CORS headers
        return buildResponse(200, response);
    }
    catch (error) {
        // Handle errors
        console.error('Error in handler:', error);
        if (error.message === 'HTTP Error: Blocked') {
            return buildResponse(403, { message: 'Access to the API is blocked.' });
        }
        else {
            return buildResponse(500, { message: 'Error fetching data from external API', error: error.message });
        }
    }
});
exports.handler = handler;
// Function to download data for all coins
function downloadAllData() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://min-api.cryptocompare.com/data/news/feeds?api_key=98c2315a85bd1ed2657e8426f03afc6359bb9cb3b434f1696dae5eccc97c3ec9";
        try {
            const response = yield axios.get(url);
            return response.data;
        }
        catch (error) {
            console.error('Failed to download all data:', error);
            return buildResponse(500, 'Failed to fetch all data');
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
