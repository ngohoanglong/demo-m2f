import { getMFAData, updateMFAData } from "@/lib/mfa-store";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST(request: Request) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return NextResponse.json(
        { error: "User ID and token are required" },
        { status: 400 }
      );
    }

    const mfaData = getMFAData(userId);

    if (!mfaData) {
      return NextResponse.json(
        { error: "MFA secret not found. Please generate a new secret." },
        { status: 404 }
      );
    }

    // Verify the token before enabling
    const isValid = authenticator.verify({
      token,
      secret: mfaData.secret,
    });

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid token. Please try again." },
        { status: 400 }
      );
    }

    // Mark MFA as enabled
    updateMFAData(userId, { enabled: true });

    return NextResponse.json({
      success: true,
      message: "MFA has been enabled successfully",
    });
  } catch (error) {
    console.error("Error enabling MFA:", error);
    return NextResponse.json(
      { error: "Failed to enable MFA" },
      { status: 500 }
    );
  }
}
