import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 465),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

try {
  console.log("Test de connexion à Gmail...");

  await transporter.verify();

  console.log("✅ Connexion Gmail réussie !");

  const result = await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: process.env.ORDER_NOTIFICATION_EMAIL,
    subject: "Test des commandes BS3",
    text: "Si tu reçois ce message, l'envoi des e-mails fonctionne.",
  });

  console.log("✅ E-mail envoyé :", result.messageId);
} catch (error) {
  console.error("❌ Échec de l'envoi :");
  console.error("Code :", error.code);
  console.error("Réponse SMTP :", error.response);
  console.error("Message :", error.message);
}