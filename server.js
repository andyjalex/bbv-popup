const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

const requiredBookingFields = [
  "name",
  "email",
  "slotLabel",
  "teamName",
  "ability",
];

const hasEmailConfig = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.MAIL_FROM,
  );
};

const createTransporter = () => {
  console.log("Using service gmail transporter");
  console.log({
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
  });
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildConfirmationEmail = (booking) => {
  const safeBooking = Object.fromEntries(
    Object.entries(booking).map(([key, value]) => [
      key,
      String(value).replace(/[&<>"']/g, (character) => {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        }[character];
      }),
    ]),
  );
  const subject = `Your BBVC slot: ${booking.slotLabel}`;
  const text = [
    `Hi ${booking.name},`,
    "",
    "Thanks for booking your BBVC popup slot.",
    "",
    `Slot: ${booking.slotLabel}`,
    `Team: ${booking.teamName}`,
    `Ability: ${booking.ability}`,
    booking.whatsapp ? `WhatsApp: ${booking.whatsapp}` : null,
    "",
    "If anything changes, we'll use your WhatsApp number to share updates.",
    "",
    "See you on the sand,",
    "BBVC",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Hi ${safeBooking.name},</p>
    <p>Thanks for booking your BBVC charity event slot.</p>
    <ul>
      <li><strong>Slot:</strong> ${safeBooking.slotLabel}</li>
      <li><strong>Team:</strong> ${safeBooking.teamName}</li>
      <li><strong>Ability:</strong> ${safeBooking.ability}</li>
      ${safeBooking.whatsapp ? `<li><strong>WhatsApp:</strong> ${safeBooking.whatsapp}</li>` : ""}
    </ul>
    <p>If anything changes, we'll use your WhatsApp number to share updates.</p>
    <p>See you on the sand,<br />BBVC</p>
  `;

  return { subject, text, html };
};

app.post("/api/send-confirmation", async (req, res) => {
  console.log("Hit /api/send-confirmation");
  console.log("SMTP_USER exists:", !!process.env.SMTP_USER);
  console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);
  const booking = req.body || {};
  const missingField = requiredBookingFields.find((field) => !booking[field]);

  if (missingField) {
    return res.status(400).json({
      error: `Missing required field: ${missingField}`,
    });
  }

  if (!hasEmailConfig()) {
    console.error("Email config missing", {
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      MAIL_FROM: !!process.env.MAIL_FROM,
      MAIL_REPLY_TO: !!process.env.MAIL_REPLY_TO,
    });

    return res.status(500).json({
      error: "Email service is not configured.",
    });
  }

  try {
    const transporter = createTransporter();
    const confirmationEmail = buildConfirmationEmail(booking);
console.log("About to send email");
    await transporter.sendMail({
      // from: process.env.MAIL_FROM,
      // to: booking.email,
      // replyTo: process.env.MAIL_REPLY_TO || process.env.MAIL_FROM,
      // ...confirmationEmail,

      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "BBVC test email",
      text: "Testing Gmail from Render",
    });
    console.log("Email sent");

    return res.json({ ok: true });
  } catch (error) {
    console.error("Failed to send booking confirmation email:", error);
    return res.status(500).json({
      error: "Could not send confirmation email.",
    });
  }
});

app.use(express.static(path.join(__dirname, "build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const server = app.listen(port, (error) => {
  if (error) {
    console.error("Failed to start BBVC app:", error);
    process.exit(1);
  }

  console.log(`BBVC app listening on port ${port}`);
});

server.on("error", (error) => {
  console.error("Failed to start BBVC app:", error);
  process.exit(1);
});
