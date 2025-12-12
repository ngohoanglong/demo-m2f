import { getMFAData, updateMFAData } from "@/lib/mfa-store";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";

export async function POST(request: Request) {
  try {
    const { userId, token, backupCode } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const mfaData = getMFAData(userId);

    if (!mfaData) {
      return NextResponse.json(
        { error: "MFA not set up for this user" },
        { status: 404 }
      );
    }

    // Check if it's a backup code
    if (backupCode) {
      const index = mfaData.backupCodes.indexOf(backupCode);
      if (index === -1) {
        return NextResponse.json(
          { error: "Invalid backup code" },
          { status: 400 }
        );
      }
      // Remove used backup code
      const updatedCodes = [...mfaData.backupCodes];
      updatedCodes.splice(index, 1);
      updateMFAData(userId, { backupCodes: updatedCodes });
      return NextResponse.json({ valid: true, usedBackupCode: true });
    }

    // Verify TOTP token
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const isValid = authenticator.verify({
      token,
      secret: mfaData.secret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying MFA token:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}
