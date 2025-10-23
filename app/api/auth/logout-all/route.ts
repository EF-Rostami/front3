// app/api/auth/logout-all/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪🚪 Logout all API hit');
    
    const accessToken = request.cookies.get('access_token')?.value;
    
    // Call FastAPI logout-all if token exists
    if (accessToken) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/auth/logout-all`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Logged out from ${data.sessions_terminated} devices`);
        }
      } catch (error) {
        console.error('❌ FastAPI logout-all error:', error);
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
    
    console.log('✅ All sessions cleared');
    return response;
    
  } catch (error) {
    console.error('💥 Logout all error:', error);
    return NextResponse.json(
      { error: 'Logout all failed' },
      { status: 500 }
    );
  }
}