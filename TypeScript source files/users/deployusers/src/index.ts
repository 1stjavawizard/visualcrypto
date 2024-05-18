import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand,UpdateCommand,ScanCommand,GetCommand,DeleteCommand, GetCommandOutput,DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

const dynamodbTableName: string = 'users';
const userPath: string = '/users';
const oneuserPath: string = '/oneuser';

export const handler = async function(event: any): Promise<any> {
  console.log('Request event: ', event);
  let response: any;
  switch (true) {
    // single user
      case event.httpMethod === 'POST' && event.path === oneuserPath:
        response = await saveUser(JSON.parse(event.body));
      break;

      case event.httpMethod === 'GET' && event.path === oneuserPath:
        if (event.queryStringParameters && event.queryStringParameters.userid) {
          response = await getOneUser(parseInt(event.queryStringParameters.userid));
        } else {
          response = buildResponse(400, 'Bad Request: userid parameter is missing.');
        }
    
      break;

      case event.httpMethod === 'PUT' && event.path === oneuserPath:
        const requestBody: any = JSON.parse(event.body);
        response = await updateUser(requestBody.userid, requestBody.updateKey, requestBody.updateValue);
      break;

      case event.httpMethod === 'DELETE' && event.path === oneuserPath:
        response = await deleteUser(JSON.parse(event.body).userid);
      break;
   
 // all users
    case event.httpMethod === 'GET' && event.path === userPath:
      response = await getAllUsers();
      break;
    case event.httpMethod === 'POST' && event.path === userPath:
      response = await saveUser(JSON.parse(event.body));
      break;

    default:
      response = buildResponse(404, '404 Not Found');
  }
  return response;
}





async function getOneUser(userid:number) : Promise<any> {
  //Create command
  const command = new GetCommand({
      TableName: dynamodbTableName,
      Key: {
          'userid': userid
      }
  });

  //Execute command and output results
  try {
      const response = await documentClient.send(command);
      return buildResponse(200,response);
      // console.log(response);
  } catch (err) {
      console.error("ERROR getting data: " + JSON.stringify(err));
  }
}


async function fetchOneUser(userid: number): Promise<any> {
  try {
    const command = new GetCommand({
      TableName: dynamodbTableName,
      Key: {
        "userId": { N: String(userid) } // Assuming userId is a number
      }
    });

    const response: GetCommandOutput = await documentClient.send(command);
    const userData = response.Item; // Assuming you expect only one user

    if (userData) {
      console.log("User data:", userData);
      // Perform further actions with userData if needed
    } else {
      console.log("User not found.");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}

async function getAllUsers() : Promise<any> {
  //Create command to scan entire table
  const command = new ScanCommand({
      TableName: dynamodbTableName
  });

  try {
      const response = await documentClient.send(command);
      return buildResponse(200,response);
      // console.log(response.Items);
  } catch (err) {
      console.error("ERROR scanning table: " + JSON.stringify(err));
  }
}


async function saveUser(requestBody: any) : Promise<any> {
  //Create command with parameters of item we want to store
  const command = new PutCommand({
      TableName: dynamodbTableName,
      Item: requestBody
  });

  //Store data in DynamoDB and handle errors
  try {
      const response = await documentClient.send(command);
      return buildResponse(200,response);
      // console.log(response);
  } catch (err) {
      console.error("ERROR uploading data: " + JSON.stringify(err));
  }
}



// async function updateUser(userid: string, updateKey: string, updateValue: any): Promise<any> {
//   //Create command with update parameters
//   const command = new UpdateCommand({
//       TableName: dynamodbTableName,
//       Key: {
//         'userid': userid
//       },
//       UpdateExpression: `set ${updateKey} = :value`,
//       ExpressionAttributeValues : {
//         ':value': updateValue
//       }
//   });

//   //Update item and log results
//   try {
//       const response = await documentClient.send(command);
//       return buildResponse(200,response);
//       // console.log(response);
//   } catch (err) {
//       console.error("ERROR updating table: " + JSON.stringify(err));
//   }
// }

async function updateUser(userid: string, updateKey: string, updateValue: any): Promise<any> {
  try {
    const command = new UpdateCommand({
      TableName: dynamodbTableName,
      Key: {
        'userid': { S: userid } // Assuming userid is a string
      },
      UpdateExpression: `SET ${updateKey} = :value`, // Corrected typo in UpdateExpression
      ExpressionAttributeValues: {
        ':value': { S: updateValue } // Assuming updateValue is a string
      }
    });

    const response = await documentClient.send(command);
    return buildResponse(200, response);
    // console.log(response);
  } catch (error) {
    // console.error("ERROR updating table:", error);
    return buildResponse(500, "Internal Server Error");
  }
}


async function deleteUser(userid: number): Promise<any> {
  //Create command with details of item we want to delete
  const command = new DeleteCommand({
      TableName: dynamodbTableName,
      Key: {
        'userid': userid
      },
  });
  //Execute command and output results
  try {
      const response = await documentClient.send(command);
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





// import { DynamoDB } from 'aws-sdk';
// import axios from 'axios';

// const dynamoDb = new DynamoDB.DocumentClient();

// export const handler = async (event: any) => {
//   try {
//     const externalApiData = await fetchDataFromExternalAPI();
    
//     await writeToDynamoDB(externalApiData);
    
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Data saved to DynamoDB' })
//     };
//   } catch (error) {
//     console.error('Handler error:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Error saving data to DynamoDB', error: error.message })
//     };
//   }
// };

// const fetchDataFromExternalAPI = async () => {
//   try {
//     const response = await axios.get('https://api.example.com/data'); // Replace with your API endpoint
//     return response.data; // Modify this if the data structure differs
//   } catch (error) {
//     console.error('Error fetching data from external API:', error);
//     throw error; // Rethrow the error to be handled by the caller
//   }
// };

// const writeToDynamoDB = async (data: any) => {
//   const params = {
//     TableName: 'YourDynamoDBTableName', // Replace with your actual DynamoDB table name
//     Item: {
//       id: data.id, // Ensure this key matches your DynamoDB primary key and that `id` exists in data
//       ...data
//     }
//   };
  
//   try {
//     await dynamoDb.put(params).promise();
//   } catch (error) {
//     console.error('Error writing to DynamoDB:', error);
//     throw error; // Rethrow the error to be handled by the caller
//   }
// };


// import { DynamoDB } from 'aws-sdk';

// const dynamoDb = new DynamoDB.DocumentClient();

// export const handler = async (event: any) => {
//   try {
//     const externalApiData = await fetchDataFromExternalAPI();
    
//     await writeToDynamoDB(externalApiData);
    
//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Data saved to DynamoDB' })
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Error saving data to DynamoDB' })
//     };
//   }
// };

// const fetchDataFromExternalAPI = async () => {
//   // Implement logic to fetch data from the external API
//   // For example, using axios or fetch
// };

// const writeToDynamoDB = async (data: any) => {
//   const params = {
//     TableName: 'YourDynamoDBTableName',
//     Item: data
//   };
  
//   await dynamoDb.put(params).promise();
// };
