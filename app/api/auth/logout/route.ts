// app/api/auth/logout/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout API hit');
    
    const accessToken = request.cookies.get('access_token')?.value;
    
    // Call FastAPI logout if token exists
    if (accessToken) {
      try {
        await fetch(`${process.env.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        console.log('✅ FastAPI logout successful');
      } catch (error) {
        console.error('❌ FastAPI logout error:', error);
        // Continue with logout even if backend fails
      }
    }
    
    // Clear cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    console.log('✅ Cookies cleared');
    return response;
    
  } catch (error) {
    console.error('💥 Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}