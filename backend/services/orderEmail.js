import nodemailer from "nodemailer";

function createTransporter() {
  const mailPort = Number(process.env.MAIL_PORT || 465);
  const mailUser = process.env.MAIL_USER || "bsambe67@gmail.com";
  // Google displays app passwords in groups separated by spaces; SMTP expects
  // the actual 16-character password without those visual separators.
  const mailPassword = process.env.MAIL_PASSWORD?.replace(/\s+/g, "");

  if (!mailPassword) {
    throw new Error("MAIL_PASSWORD est absente de la configuration.");
  }
  if (!Number.isInteger(mailPort) || mailPort < 1 || mailPort > 65535) {
    throw new Error("MAIL_PORT doit être un port valide.");
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: mailPort,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    secure: process.env.MAIL_SECURE
      ? process.env.MAIL_SECURE === "true"
      : mailPort === 465,
    auth: { user: mailUser, pass: mailPassword }
  });
}

export async function verifyOrderEmailConfiguration() {
  const transporter = createTransporter();
  try {
    await transporter.verify();
  } finally {
    transporter.close();
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[character]);
}

export async function sendOrderNotification(order) {
  const mailPort = Number(process.env.MAIL_PORT || 465);
  const mailUser = process.env.MAIL_USER || "bsambe67@gmail.com";
  const mailPassword = process.env.MAIL_PASSWORD?.replace(/\s+/g, "");
  const notificationEmail = process.env.ORDER_NOTIFICATION_EMAIL || "bsambe67@gmail.com";

  if (!mailPassword) {
    return "not_configured";
  }
  const transporter = createTransporter();

  const customer = order.customer;
  const items = order.items?.length
    ? order.items
    : [{ name: order.product.name, category: order.product.category, unitPrice: order.product.unitPrice, quantity: order.quantity }];
  const total = `${order.total.toLocaleString("fr-FR")} FCFA`;
  const safe = {
    name: escapeHtml(customer.name),
    phone: escapeHtml(customer.phone),
    email: escapeHtml(customer.email || "Non renseigné"),
    address: escapeHtml(customer.address),
    notes: escapeHtml(customer.notes || "Aucune"),
    items: items.map((item) => ({
      name: escapeHtml(item.name),
      category: escapeHtml(item.category),
      quantity: item.quantity,
      unitPrice: item.unitPrice.toLocaleString("fr-FR"),
      subtotal: (item.unitPrice * item.quantity).toLocaleString("fr-FR")
    }))
  };

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || `BS3 Commandes <${mailUser}>`,
      to: notificationEmail,
      replyTo: customer.email || undefined,
      subject: `Nouvelle commande BS3 - ${items.length} produit(s)`,
      text: [
        "Nouvelle commande reçue sur le site BS3.",
        `Client : ${customer.name}`,
        `Téléphone : ${customer.phone}`,
        `E-mail : ${customer.email || "Non renseigné"}`,
        `Adresse : ${customer.address}`,
        ...items.map((item) => `Produit : ${item.name} (${item.category}) × ${item.quantity} — ${item.unitPrice.toLocaleString("fr-FR")} FCFA/unité`),
        `Total : ${total}`,
        `Message : ${customer.notes || "Aucun"}`
      ].join("\n"),
      html: `<h2>Nouvelle commande reçue sur le site BS3</h2>
      <p><strong>Client :</strong> ${safe.name}<br>
      <strong>Téléphone :</strong> ${safe.phone}<br>
      <strong>E-mail :</strong> ${safe.email}<br>
      <strong>Adresse :</strong> ${safe.address}</p>
      <p><strong>Articles commandés :</strong></p>
      <ul>${safe.items.map((item) => `<li>${item.name} (${item.category}) × ${item.quantity} — ${item.subtotal} FCFA</li>`).join("")}</ul>
      <p><strong>Total :</strong> ${total}</p>
      <p><strong>Message :</strong> ${safe.notes}</p>`
    });
  } finally {
    transporter.close();
  }

  return "sent";
}
