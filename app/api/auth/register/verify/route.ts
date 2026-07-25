import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ error: "Server database not configured" }, { status: 500 });
    }

    const emailKey = email.toLowerCase().trim();

    // Fetch the stored OTP record
    const otpRef = firestore.collection("verification_otps").doc(emailKey);
    const otpDoc = await otpRef.get();

    if (!otpDoc.exists) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    const otpData = otpDoc.data()!;

    // Check if OTP is expired
    if (Date.now() > otpData.expiresAt) {
      await otpRef.delete();
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (otp !== otpData.otp) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    // Register the user in Firestore (server-side, no permission issues)
    await firestore.collection("users").doc(emailKey).set({
      name: otpData.name,
      password: otpData.password,
      createdAt: new Date(),
    });

    // Clean up OTP record
    await otpRef.delete();

    return NextResponse.json({
      success: true,
      user: { email: emailKey, name: otpData.name },
    });
  } catch (error: any) {
    console.error("Register verify error:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
