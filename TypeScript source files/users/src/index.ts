import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand,UpdateCommand,ScanCommand,GetCommand,DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";



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
        response = await getOneUser(event.queryStringParameters.userid);
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





async function getOneUser(userid:number) : Promise<void> {
  //Create command
  const command = new GetCommand({
      TableName: dynamodbTableName,
      Key: {
          userid: userid
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


async function getAllUsers() : Promise<void> {
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


async function saveUser(requestBody: any) : Promise<void> {
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



async function updateUser(userid: string, updateKey: string, updateValue: any): Promise<any> {
  //Create command with update parameters
  const command = new UpdateCommand({
      TableName: dynamodbTableName,
      Key: {
        'userid': userid
      },
      UpdateExpression: `set ${updateKey} = :value`,
      ExpressionAttributeValues : {
        ':value': updateValue
      }
  });

  //Update item and log results
  try {
      const response = await documentClient.send(command);
      return buildResponse(200,response);
      // console.log(response);
  } catch (err) {
      console.error("ERROR updating table: " + JSON.stringify(err));
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
