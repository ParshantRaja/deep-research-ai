import { NextResponse } from "next/server";
import { firestore } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (!firestore) {
      return NextResponse.json({ error: "Server database not configured" }, { status: 500 });
    }

    const emailKey = email.toLowerCase().trim();

    // Fetch user from Firestore (server-side, no permission issues)
    const userRef = firestore.collection("users").doc(emailKey);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 401 }
      );
    }

    const userData = userDoc.data()!;

    // Verify password
    if (userData.password !== password) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: { email: emailKey, name: userData.name },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}
