const WHATSAPP_TIMEOUT_MS = 10_000;

function whatsappConfiguration() {
  const accountSid = (process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = (process.env.TWILIO_AUTH_TOKEN || "").trim();
  const sender = (process.env.TWILIO_WHATSAPP_SENDER || "").trim();
  const recipient = (process.env.WHATSAPP_NOTIFICATION_TO || "").trim();
  const contentSid = (process.env.TWILIO_WHATSAPP_CONTENT_SID || "").trim();

  if (!accountSid || !authToken || !sender || !recipient || !contentSid) return null;
  if (!sender.startsWith("whatsapp:+") || !recipient.startsWith("whatsapp:+")) {
    throw new Error("WhatsApp sender and recipient must use whatsapp:+E.164 format.");
  }
  if (!contentSid.startsWith("HX")) {
    throw new Error("TWILIO_WHATSAPP_CONTENT_SID must be an approved Twilio Content Template SID.");
  }

  return { accountSid, authToken, sender, recipient, contentSid };
}

function createOrderVariables(order) {
  const items = (order.items || [])
    .map((item) => `${item.name} x${item.quantity}`)
    .join(", ")
    .slice(0, 900);

  return {
    1: String(order.customer?.name || "Client").slice(0, 120),
    2: String(order._id || "nouvelle").slice(-24),
    3: items || "Commande",
    4: Math.round(order.total).toLocaleString("fr-FR")
  };
}

export async function sendOrderWhatsAppNotification(order) {
  const config = whatsappConfiguration();
  if (!config) return "not_configured";

  const form = new URLSearchParams({
    To: config.recipient,
    From: config.sender,
    ContentSid: config.contentSid,
    ContentVariables: JSON.stringify(createOrderVariables(order))
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
      signal: AbortSignal.timeout(WHATSAPP_TIMEOUT_MS)
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(`Twilio WhatsApp error ${result.code || response.status}: ${result.message || "envoi refusé"}`);
  }

  return "sent";
}
