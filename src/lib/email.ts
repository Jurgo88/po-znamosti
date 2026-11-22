import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Resend } from "resend";

type Email = { to: string; subject: string; text: string; html?: string; replyTo?: string };

/** Pošle e-mail cez Resend. Bez RESEND_API_KEY (lokálny vývoj) ho iba vypíše do konzoly. */
export async function sendEmail(email: Email) {
  const { env } = getCloudflareContext();
  if (!env.RESEND_API_KEY) {
    console.log(`\n[e-mail pre ${email.to}] ${email.subject}\n${email.text}\n`);
    return;
  }
  const resend = new Resend(env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM ?? "Po známosti <onboarding@resend.dev>",
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
    replyTo: email.replyTo,
  });
  if (error) throw new Error(`Odoslanie e-mailu zlyhalo: ${error.message}`);
}
