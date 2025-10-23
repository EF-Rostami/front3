// ============================================
// app/api/auth/login/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Login API route hit');
    
    const credentials = await request.json();
    console.log('📧 Email:', credentials.email);
    
    if (!process.env.API_BASE_URL) {
      console.error('❌ API_BASE_URL not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Login to FastAPI
    console.log('📡 Calling FastAPI login...');
    const loginResponse = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ FastAPI login failed:', errorText);
      return NextResponse.json(
        { error: 'Login failed', detail: errorText },
        { status: loginResponse.status }
      );
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Got tokens from FastAPI');
    
    // Fetch user data with roles
    console.log('👤 Fetching user data...');
    const userResponse = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    
    let userWithRoles = null;
    
    if (userResponse.ok) {
      const fullUserData = await userResponse.json();
      userWithRoles = fullUserData.user;
      console.log('✅ User roles:', userWithRoles.roles);
    } else {
      console.error('❌ Could not fetch user data');
    }
    
    // Set cookies and return response
    const response = NextResponse.json({ 
      user: userWithRoles,
      success: true 
    });
    
    // ⚠️ Testing: 15 minute expiry
    response.cookies.set('access_token', loginData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes for testing
      path: '/',
    });
    
    response.cookies.set('refresh_token', loginData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    console.log('✅ Login complete');
    return response;
    
  } catch (error) {
    console.error('💥 Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}