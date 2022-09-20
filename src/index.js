import AWS from 'aws-sdk'
import { getConfig } from './utils/config.js';
import { config as loadEnv } from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; 

const dynamo = new AWS.DynamoDB();

const ping = async (website) => {
    let statusCode;
    try {
        const response = await axios.get(website);
        statusCode = response.status;
    } catch (error) {
        statusCode = error.status;
    }
    return statusCode;
}

const saveToDynamoDB = async (items) => {
    const table = getConfig().db.table;
    const payload = {
        RequestItems: {
            [table]: items
        }
    }
    console.log('Request', JSON.stringify(payload));
    await dynamo.batchWriteItem(payload, function (err, data) {
        console.log('Response', data);
        if (err) throw err;
    });
}

export const handler = async (event, context) => {
    loadEnv();
    let results = [];
    const pingTime = event['time'];
    const websiteList = getConfig().websites;

    for (const website of websiteList) {
        const statusCode = await ping(website);
        results = [...results, { PutRequest: { Item: { id : {"S": uuidv4()}, website: {"S": website}, httpCode: {"N": statusCode.toString()}, time: {"S": pingTime} } } }]
    }
    
    try {
        await saveToDynamoDB(results);
    } catch (error) {
        console.error('Error', JSON.stringify(error));
        return false;
    }
    return true;
};
