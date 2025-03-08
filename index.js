require('dotenv').config();
const { App } = require('@slack/bolt');
const { createAzureOpenAIClient } = require('./azureClient');

console.log("SLACK_BOT_TOKEN:", process.env.SLACK_BOT_TOKEN);
console.log("SLACK_APP_TOKEN:", process.env.SLACK_APP_TOKEN);
console.log("SLACK_SIGNING_SECRET:", process.env.SLACK_SIGNING_SECRET);


const PORT = 5555; 


const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,  // ✅ Use SLACK_APP_TOKEN
    socketMode: true,
});

const azureOpenAIClient = createAzureOpenAIClient(
    process.env.AZURE_OPENAI_ENDPOINT,
    process.env.AZURE_OPENAI_API_KEY,
    process.env.AZURE_OPENAI_API_VERSION

);

slackApp.command('/performance', async ({ command, ack, say }) => {
    await ack();
    const userInput = command.text;

    try {
        const messages = [{ role: 'user', content: `Analyze the following performance data: ${userInput}` }];
        const result = await azureOpenAIClient.chat.completions.create({
            messages,
            stream: false,
        });
        const analysis = result.choices[0].message.content;
        await say(`Performance Analysis:\n${analysis}`);
    } catch (error) {
        console.error('Error communicating with Azure OpenAI:', error);
        await say('Sorry, I encountered an error while processing your request.');
    }
});

// starting event 
slackApp.event('app_home_opened', async ({ event, client }) => {
    try {
        await client.views.publish({
            user_id: event.user,
            view: {
                type: 'home',
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: 'Welcome to the Performance Analysis App! :wave:'
                        }
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: 'Enter the performance data you would like to analyze using the `/performance` command.'
                        }
                    }
                ]
            }
        });
    } catch (error) {
        console.error('Error publishing home view:', error);
    }
}
);

(async () => {
    await slackApp.start(PORT);
    console.log(`⚡️ Bolt app is running on port ${PORT}!`);
} )();