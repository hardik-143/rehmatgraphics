import nodemailer from "nodemailer";
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM,
} from "@/app/env";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (transporter) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
  });

  return transporter;
};

export const sendOtpEmail = async (
  to: string,
  otpCode: string,
  expiresInMinutes: number
) => {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Your rehmathgraphics secure login code",
    text: `Use the following one-time code to complete your login: ${otpCode}. This code expires in ${expiresInMinutes} minutes.`,
    html: `
      <p>Hi there,</p>
      <p>Use the following one-time code to complete your login:</p>
      <p style="font-size: 24px; letter-spacing: 4px; font-weight: bold;">${otpCode}</p>
      <p>This code expires in ${expiresInMinutes} minutes. If you did not try to sign in, you can ignore this email.</p>
      <p>— rehmathgraphics Print Security</p>
    `,
  });
};
