import { Router, type IRouter } from "express";
import { Resend } from "resend";
import { SubscribeToUpdatesBody } from "@workspace/api-zod";

const router: IRouter = Router();

const FROM_EMAIL = process.env.RFC_FROM_EMAIL ?? "AI-Native Office <onboarding@resend.dev>";
const NOTIFY_EMAIL = process.env.RFC_NOTIFY_EMAIL ?? "delivered@resend.dev";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

router.post("/subscribe", async (req, res) => {
  const parsed = SubscribeToUpdatesBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ issues: parsed.error.issues }, "subscribe: invalid payload");
    return res
      .status(400)
      .json({ ok: false, message: "ERR: Malformed handshake payload." });
  }

  const { email, layers } = parsed.data;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    req.log.error("subscribe: RESEND_API_KEY is not configured");
    return res
      .status(500)
      .json({ ok: false, message: "ERR: Update feed not configured." });
  }

  const resend = new Resend(apiKey);

  const layerLines =
    layers.length > 0 ? layers.map((l) => `  - ${l}`).join("\n") : "  - (none selected)";
  const layerListHtml =
    layers.length > 0
      ? `<ul>${layers.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`
      : "<p>(none selected)</p>";

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_EMAIL,
      replyTo: email,
      subject: `RFC LOG SUBSCRIPTION — ${email}`,
      text: `New specification update subscription.\n\nEmail: ${email}\nLayers:\n${layerLines}\n`,
      html: `<h2>New specification update subscription</h2><p><strong>Email:</strong> ${escapeHtml(email)}</p><p><strong>Layers:</strong></p>${layerListHtml}`,
    });

    if (error) {
      req.log.error({ err: error }, "subscribe: resend send failed");
      return res
        .status(502)
        .json({ ok: false, message: "ERR: Handshake failed." });
    }

    req.log.info({ id: data?.id }, "subscribe: registered");
    return res.json({ ok: true, message: "200 OK: Email registered." });
  } catch (err) {
    req.log.error({ err }, "subscribe: unexpected error");
    return res
      .status(502)
      .json({ ok: false, message: "ERR: Handshake failed." });
  }
});

export default router;
