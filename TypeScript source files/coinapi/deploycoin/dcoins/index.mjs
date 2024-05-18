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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios_1 = __importDefault(require("axios"));
// Constants for API paths
const allcoinsPath = '/allcoins';
const onecoinPath = '/onecoin';
// const onecoinPath = '/onecoin/{pair}';
// Lambda handler function
const handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request event:', event);
    let response;
    try {
        switch (event.httpMethod) {
            case 'GET':
                switch (event.path) {
                    case onecoinPath:
                        // const pair = event.pathParameters.pair;
                        // Assume the pair is passed as a query parameter
                        const pair = event.queryStringParameters.pair;
                        response = yield downloadOneData(pair);
                        break;
                    case allcoinsPath:
                        response = yield downloadAllData();
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
    }
    catch (error) {
        console.error('Error processing request:', error);
        response = buildResponse(500, 'Internal Server Error');
    }
    return response;
});
exports.handler = handler;
// Function to download data for all coins
function downloadAllData() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "https://api.pro.coinbase.com/products";
        try {
            const { data } = yield axios_1.default.get(url);
            return buildResponse(200, processData(data));
        }
        catch (error) {
            console.error('Failed to download all data:', error);
            return buildResponse(500, 'Failed to fetch all data');
        }
    });
}
// Function to download data for a single pair
function downloadOneData(pair) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://api.pro.coinbase.com/products/${pair}/candles?granularity=86400`;
        try {
            const { data } = yield axios_1.default.get(url);
            return buildResponse(200, processData(data));
        }
        catch (error) {
            console.error('Failed to download data for:', pair, error);
            return buildResponse(500, 'Failed to fetch data for the specified pair');
        }
    });
}
// Function to process data
function processData(data) {
    // Process your data here as needed
    return data;
}
// Function to build HTTP response
function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Ensure CORS compatibility
        },
        body: JSON.stringify(body)
    };
}
