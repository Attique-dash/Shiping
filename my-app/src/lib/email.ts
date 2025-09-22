import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  return transporter;
}

export async function sendNewPackageEmail(opts: {
  to: string;
  firstName: string;
  trackingNumber: string;
  status: string;
  weight?: number;
  shipper?: string;
}) {
  const t = getTransporter();
  if (!t) return { sent: false, reason: "Email not configured" };

  const { to, firstName, trackingNumber, status, weight, shipper } = opts;

  const subject = `New Package Received — ${trackingNumber}`;
  const html = `
  <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111">
    <h2 style="margin:0 0 12px 0;">New Package Received</h2>
    <p>Hi ${firstName || "Customer"},</p>
    <p>Great news! We have received a new package for you.</p>
    <h3 style="margin:16px 0 8px 0;">Package Information</h3>
    <ul style="padding-left:16px;">
      <li><strong>Shipper:</strong> ${shipper || "UNKNOWN"}</li>
      <li><strong>Tracking Number:</strong> ${trackingNumber}</li>
      <li><strong>Weight:</strong> ${weight ?? "-"}</li>
      <li><strong>Status:</strong> ${status}</li>
    </ul>
    <p>
      You can view live updates in your portal.
    </p>
  </div>`;

  await t.sendMail({
    from: EMAIL_USER,
    to,
    subject,
    html,
  });
  return { sent: true };
}
