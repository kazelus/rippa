import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/services";
import { initializeDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    // Ensure database tables exist
    await initializeDatabase();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    // Create user
    const user = await createUser(email, password);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
