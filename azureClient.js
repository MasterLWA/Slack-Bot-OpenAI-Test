const { AzureOpenAI } = require("openai");
require('dotenv').config();

function createAzureOpenAIClient(endpoint, apiKey, deployment, apiVersion) {
    if (!apiKey) {
        throw new Error("Missing API Key! Set AZURE_OPENAI_API_KEY in .env file.");
    }

    return new AzureOpenAI({
        apiKey: apiKey, // Use only API Key
        endpoint: endpoint,
        deployment: deployment,
        apiVersion: apiVersion
    });
}

module.exports = { createAzureOpenAIClient };
