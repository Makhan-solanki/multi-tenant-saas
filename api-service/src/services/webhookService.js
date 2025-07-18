const axios = require('axios');
const WebhookConfig = require('../model/WebhookConfig');

async function sendWebhookNotification(event, payload) {
  try {
    const config = await WebhookConfig.findOne({ customerId: payload.customerId });
    if (!config || !config.events.includes(event)) return;

    await axios.post(config.url, { event, payload }, { timeout: 5000 });
    console.log(`✅ Webhook sent to ${config.url} for event ${event}`);
  } catch (err) {
    console.error('❌ Webhook send error:', err.message);
  }
}

module.exports = { sendWebhookNotification };
