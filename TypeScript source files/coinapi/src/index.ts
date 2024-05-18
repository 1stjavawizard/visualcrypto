
import axios from 'axios';


interface SingleData {
    quote_currency:string,
    base_currency:string
}
interface ManyData { 
    articles:Array<SingleData>
}


const allcoins: string = '/allcoins';
const onecoin: string = '/onecoin';

export const handler = async function(event: any): Promise<any> {
    console.log('Request event: ', event);
    const { pathParameters } = event;
    if (pathParameters && pathParameters.parameter1) {
        // Get the value of the path variable
        const parameter1Value = pathParameters.pairs;

    }
    let response: any;
    switch (true) {
      // single user
        case event.httpMethod === 'GET' && event.path === onecoin:
          response = await downloadOneData(JSON.parse(event.body).pairs);
        break;
  
        case event.httpMethod === 'GET' && event.path === allcoins:
          response = await downloadAllData();
        break;
  
      
  
      default:
        response = buildResponse(404, '404 Not Found');
    }
    return response;
  }

  async function downloadAllData() {
   

 
    let url: string = "https://api.pro.coinbase.com/products";


    
    let data:ManyData = (await axios.get(url)).data;

    
    processData(data);
}

async function downloadOneData(thepairs:any): Promise<any> {
   

 
    let url: string = `https://api.pro.coinbase.com/products/${thepairs}/candles?granularity=86400`;


    
    let data:ManyData = (await axios.get(url)).data;

    
    processData(data);
}



async function processData(data: ManyData): Promise<any> {


    try {
        const response = data
        return buildResponse(200,response);
        // console.log(response);
    } catch (err) {
        console.error("ERROR deleting data: " + JSON.stringify(err));
    }
 
   
}

function buildResponse(statusCode: number, body: any): any {
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  }
  