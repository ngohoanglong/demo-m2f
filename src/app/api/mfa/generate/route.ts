import { setMFAData } from "@/lib/mfa-store";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Generate a random secret
    const secret = authenticator.generateSecret();

    // Generate 8 backup codes
    const backupCodes = Array.from({ length: 8 }, () => {
      const code = crypto.randomBytes(4).toString("hex");
      return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(
        8,
        12
      )}-${code.slice(12, 16)}`;
    });

    // Store the secret and backup codes in file
    setMFAData(userId, { secret, backupCodes, enabled: false });

    return NextResponse.json({
      secret,
      backupCodes,
    });
  } catch (error) {
    console.error("Error generating MFA secret:", error);
    return NextResponse.json(
      { error: "Failed to generate MFA secret" },
      { status: 500 }
    );
  }
}
