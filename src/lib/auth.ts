import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { getDb, schema } from "@/db";
import { sendEmail } from "@/lib/email";

/**
 * Better Auth inštancia. D1 binding existuje len počas požiadavky,
 * preto sa auth vytvára pri každej požiadavke (je to lacné).
 */
export function getAuth() {
  const { env } = getCloudflareContext();
  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDb(), {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 60, // 60 dní
      updateAge: 60 * 60 * 24,
    },
    plugins: [
      magicLink({
        expiresIn: 60 * 15,
        sendMagicLink: async ({ email, url }) => {
          await sendEmail({
            to: email,
            subject: "Prihlásenie do Po známosti",
            text: `Ahoj,\n\nprihlásiš sa kliknutím na tento odkaz (platí 15 minút):\n${url}\n\nAk si o prihlásenie nežiadal, správu ignoruj.\n\nPo známosti`,
            html: `<p>Ahoj,</p><p>prihlásiš sa kliknutím na tento odkaz (platí 15 minút):</p><p><a href="${url}">Prihlásiť sa do Po známosti</a></p><p>Ak si o prihlásenie nežiadal, správu ignoruj.</p>`,
          });
        },
      }),
    ],
  });
}
