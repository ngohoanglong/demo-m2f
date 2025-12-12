import { getMFAData } from "@/lib/mfa-store";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const mfaData = getMFAData(userId);
    const isEnabled = !!(mfaData && mfaData.enabled);

    return NextResponse.json({
      enabled: isEnabled,
      backupCodesRemaining: mfaData?.backupCodes.length || 0,
    });
  } catch (error) {
    console.error("Error checking MFA status:", error);
    return NextResponse.json(
      { error: "Failed to check MFA status" },
      { status: 500 }
    );
  }
}
