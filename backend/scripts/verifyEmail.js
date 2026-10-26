import "dotenv/config";
import { verifyOrderEmailConfiguration } from "../services/orderEmail.js";

try {
  await verifyOrderEmailConfiguration();
  console.log("Connexion SMTP validée. Les notifications de commande peuvent être envoyées.");
} catch (error) {
  if (error.code === "EAUTH" || error.responseCode === 535) {
    console.error(
      "Gmail a refusé l'authentification. Vérifiez MAIL_USER et remplacez MAIL_PASSWORD par le mot de passe d'application Google."
    );
  } else {
    console.error("Échec de la vérification SMTP. Vérifiez MAIL_HOST, MAIL_PORT et les paramètres Gmail.");
  }

  if (error.code) {
    console.error(`Code SMTP : ${error.code}`);
  }
  process.exitCode = 1;
}
