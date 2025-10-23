// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Register API route hit');
    
    const registrationData = await request.json();
    console.log('📧 Registration data:', { 
      email: registrationData.email, 
      roles: registrationData.requested_roles 
    });
    
    // Check if API_BASE_URL is set
    if (!process.env.API_BASE_URL) {
      console.error('❌ API_BASE_URL environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error: API_BASE_URL not set' },
        { status: 500 }
      );
    }
    
    // Make registration request to FastAPI backend
    console.log('📡 Making request to FastAPI register endpoint...');
    const registerResponse = await fetch(`${process.env.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registrationData.email,
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        password: registrationData.password,
        requested_roles: registrationData.requested_roles,
        role_specific_data: registrationData.role_specific_data || {},
      }),
    });
    
    console.log('📡 FastAPI register response status:', registerResponse.status);
    
    if (!registerResponse.ok) {
      const errorText = await registerResponse.text();
      console.error('❌ FastAPI register error:', errorText);
      
      let errorMessage = 'Registration failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: registerResponse.status }
      );
    }
    
    const registerData = await registerResponse.json();
    console.log('✅ Registration successful');
    
    return NextResponse.json({
      message: 'Registration submitted successfully. Please wait for admin approval.',
      data: registerData,
      success: true
    });
    
  } catch (error) {
    console.error('💥 Register API route error:', error);
    console.error('💥 Error stack:', (error as Error).stack);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}