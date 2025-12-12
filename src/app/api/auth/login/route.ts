import { NextResponse } from "next/server";

// In a real app, this would verify against a database
// For demo purposes, we'll use a simple check
const DEMO_USER = {
  email: "user@example.com",
  password: "demo123", // In real app, this would be hashed
};

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Simple demo authentication
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      return NextResponse.json({
        success: true,
        userId: "demo-user-123",
        email: DEMO_USER.email,
        requiresMFA: true, // Check if user has MFA enabled
      });
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "Failed to process login" },
      { status: 500 }
    );
  }
}

