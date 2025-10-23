// app/api/[...proxy]/route.ts
import { NextRequest, NextResponse } from 'next/server';

async function handleProxyRequest(
  request: NextRequest, 
  pathSegments: string[], 
  method: string
) {
  try {
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${process.env.API_BASE_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };
    
    const requestOptions: RequestInit = {
      method,
      headers,
    };
    
    if (method !== 'GET' && method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        requestOptions.body = body;
      }
    }
    
    console.log("🔑 Access token:", accessToken);
    console.log("🧾 Headers being sent:", headers);

    console.log(`📡 Proxying ${method} request to: ${url}`);
    console.log('🔑 Access token:', accessToken ? 'Present' : 'Missing');
    
    const response = await fetch(url, requestOptions);
    if (response.status === 401) {
  console.log("🔄 Access token might be expired. Trying refresh...");
  
  const refreshResponse = await fetch(`${request.nextUrl.origin}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // important to send cookies
  });

    if (refreshResponse.ok) {
      console.log("✅ Token refreshed. Retrying original request...");

      // Retry original request with new token
      const newAccessToken = refreshResponse.headers.get('set-cookie');
      console.log(`newAccessTokin is:' ${newAccessToken}`);
      const retryResponse = await fetch(url, requestOptions);
      return new NextResponse(await retryResponse.text(), { status: retryResponse.status });
    } else {
      console.error("❌ Refresh failed, forcing logout");
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }
  }


    console.log('📥 Backend responded with:', response.status, response.statusText);
    const responseData = await response.text();
    
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    });
    
    ['content-type', 'cache-control'].forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        nextResponse.headers.set(header, value);
      }
    });
    
    return nextResponse;
    
  } catch (error) {
    console.error('💥 Proxy request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



// Fix for Next.js 15 - await params
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleProxyRequest(request, proxy, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleProxyRequest(request, proxy, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleProxyRequest(request, proxy, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleProxyRequest(request, proxy, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ proxy: string[] }> }
) {
  const { proxy } = await params;
  return handleProxyRequest(request, proxy, 'PATCH');
}