// app/api/auth/refresh/route.ts
// ============================================
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Refresh token API hit");

    const refreshToken = request.cookies.get("refresh_token")?.value;
    
    if (!refreshToken) {
      console.warn("⚠️ No refresh token");
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    // Call FastAPI refresh endpoint
    const refreshResponse = await fetch(`${process.env.API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!refreshResponse.ok) {
      console.error("❌ Refresh failed");
      
      // Clear cookies on failure
      const response = NextResponse.json(
        { error: "Token refresh failed" }, 
        { status: 401 }
      );
      response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
      response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
      return response;
    }

    const refreshData = await refreshResponse.json();
    console.log("✅ Got new tokens");

    // Fetch updated user data
    const userResponse = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${refreshData.access_token}`,
      },
    });

    let user = null;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      user = userData.user;
    }

    const response = NextResponse.json({ user, success: true });

    // ⚠️ Testing: 15 minute expiry
    response.cookies.set("access_token", refreshData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes for testing
      path: "/",
    });

    response.cookies.set("refresh_token", refreshData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    console.log("✅ Refresh complete");
    return response;

  } catch (error) {
    console.error("💥 Refresh error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
