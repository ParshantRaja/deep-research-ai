import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    // Create a transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"Deep Research" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verification Code for Deep Research",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0891b2; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Verify your email</h2>
          <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">Welcome to Deep Research! Please use the following code to complete your signup:</p>
          <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 0.5em; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">Deep Research AI - Intelligence Engine</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Gmail SMTP Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
