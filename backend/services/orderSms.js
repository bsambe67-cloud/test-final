const SMS_TIMEOUT_MS = 10_000;

function smsConfiguration() {
  const provider = (process.env.SMS_PROVIDER || "").trim().toLowerCase();
  const recipient = (process.env.SMS_NOTIFICATION_TO || "").trim();
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const sender = (process.env.TWILIO_SMS_SENDER || "").trim();

  if (!provider || !recipient || !accountSid || !authToken || !sender) {
    return null;
  }
  if (provider !== "twilio") {
    throw new Error("SMS_PROVIDER must be configured as twilio.");
  }
  if (!/^\+[1-9]\d{7,14}$/.test(recipient)) {
    throw new Error("SMS_NOTIFICATION_TO must use international E.164 format.");
  }

  return { recipient, accountSid, authToken, sender };
}

function createOrderSms(order) {
  const itemCount = order.items?.reduce((count, item) => count + item.quantity, 0)
    ?? order.quantity
    ?? 1;
  const total = Math.round(order.total).toLocaleString("en-US").replace(/,/g, " ");
  const customerName = String(order.customer?.name || "Client").replace(/[^\x20-\x7E]/g, "").slice(0, 35);
  return `Nouvelle commande BS3: ${customerName}, ${itemCount} article(s), ${total} FCFA. Consultez votre espace admin.`;
}

export async function sendOrderSmsNotification(order) {
  const config = smsConfiguration();
  if (!config) return "not_configured";

  const form = new URLSearchParams({
    To: config.recipient,
    From: config.sender,
    Body: createOrderSms(order)
  });
  const authorization = Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64");
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(config.accountSid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: form,
      signal: AbortSignal.timeout(SMS_TIMEOUT_MS)
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(`Twilio SMS error ${result.code || response.status}: ${result.message || "envoi refusé"}`);
  }

  return "sent";
}
