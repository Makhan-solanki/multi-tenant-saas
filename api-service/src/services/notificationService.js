const axios = require('axios');
const WebhookConfig = require('../model/WebhookConfig');

async function sendWebhookNotification(event, payload) {
  const config = await WebhookConfig.findOne({ customerId: payload.customerId });
  if (!config || !config.events.includes(event)) return;

  try {
    await axios.post(config.url, { event, payload });
    console.log(`Webhook sent: ${event}`);
  } catch (err) {
    console.error(`Failed to send webhook for ${event}`, err.message);
  }
}

module.exports = { sendWebhookNotification };
