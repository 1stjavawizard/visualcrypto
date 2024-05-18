import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand, ScanCommand, GetCommand, DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);
const dynamodbTableName = 'users';
const userPath = '/users';
const oneuserPath = '/oneuser';
const postoneuserPath = '/postoneuser';
export const handler = async function (event) {
    console.log('Request event: ', event);
    let response;
    switch (true) {
        // single user
        case event.httpMethod === 'POST' && event.path === oneuserPath:
            response = await saveUser(JSON.parse(event.body));
            break;
        case event.httpMethod === 'POST' && event.path === postoneuserPath:
            response = JSON.parse(event.body);
            const { email, password } = response;
            response = await getUserByEmailAndPassword(email, password);
            break;
        case event.httpMethod === 'GET' && event.path === oneuserPath:
            if (event.queryStringParameters && event.queryStringParameters.email) {
                const email = event.queryStringParameters.email
            }
            if (event.queryStringParameters && event.queryStringParameters.password) {
                const password = event.queryStringParameters.password;
            }
           
            if (email === null || password === null) {
                response = buildResponse(400, 'Email and password are required.');
            }
            else {
                response = await getUserByEmailAndPassword(email, password);
            }
            break;
        case event.httpMethod === 'PUT' && event.path === oneuserPath:
            const requestBody = JSON.parse(event.body);
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
};
async function getOneUser(userid) {
    //Create command
    const command = new GetCommand({
        TableName: dynamodbTableName,
        Key: {
            'userid': { S: userid.toString() } // Assuming userid is a string
        }
    });
    //Execute command and output results
    try {
        const response = await documentClient.send(command);
        return buildResponse(200, response);
    }
    catch (err) {
        console.error("ERROR getting data: " + JSON.stringify(err));
        return buildResponse(500, 'Internal Server Error');
    }
}
async function getAllUsers() {
    //Create command to scan entire table
    const command = new ScanCommand({
        TableName: dynamodbTableName
    });
    try {
        const response = await documentClient.send(command);
        return buildResponse(200, response);
    }
    catch (err) {
        console.error("ERROR scanning table: " + JSON.stringify(err));
        return buildResponse(500, 'Internal Server Error');
    }
}
async function saveUser(requestBody) {
    //Create command with parameters of item we want to store
    const command = new PutCommand({
        TableName: dynamodbTableName,
        Item: requestBody
    });
    //Store data in DynamoDB and handle errors
    try {
        const response = await documentClient.send(command);
        return buildResponse(200, response);
    }
    catch (err) {
        console.error("ERROR uploading data: " + JSON.stringify(err));
        return buildResponse(500, 'Internal Server Error');
    }
}
async function updateUser(userid, updateKey, updateValue) {
    try {
        const command = new UpdateCommand({
            TableName: dynamodbTableName,
            Key: {
                'userid': { S: userid } // Assuming userid is a string
            },
            UpdateExpression: `SET ${updateKey} = :value`,
            ExpressionAttributeValues: {
                ':value': { S: updateValue } // Assuming updateValue is a string
            }
        });
        const response = await documentClient.send(command);
        return buildResponse(200, response);
    }
    catch (error) {
        console.error("ERROR updating table:", error);
        return buildResponse(500, "Internal Server Error");
    }
}
async function deleteUser(userid) {
    //Create command with details of item we want to delete
    const command = new DeleteCommand({
        TableName: dynamodbTableName,
        Key: {
            'userid': { S: userid } // Assuming userid is a string
        },
    });
    //Execute command and output results
    try {
        const response = await documentClient.send(command);
        return buildResponse(200, response);
    }
    catch (err) {
        console.error("ERROR deleting data: " + JSON.stringify(err));
        return buildResponse(500, 'Internal Server Error');
    }
}
async function getUserByEmailAndPassword(email, password) {
    if (email === null || password === null) {
        return buildResponse(400, 'Email and password are required.');
    }
    try {
        const command = new GetCommand({
            TableName: dynamodbTableName,
            Key: {
                'email': { S: email }
            }
        });
        const response = await documentClient.send(command);
        const userData = response.Item;
        if (userData && userData.password && userData.password.S === password) {
            // Password comparison assuming password is stored as plain text (Not recommended, use hashed passwords)
            delete userData.password; // Remove password from response for security reasons
            return buildResponse(200, userData);
        }
        else {
            return buildResponse(404, 'User not found or invalid email/password combination');
        }
    }
    catch (error) {
        console.error("Error fetching user:", error);
        return buildResponse(500, 'Internal Server Error');
    }
}
function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    };
}
