import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Detect market based on location/language
function detectMarket(request: NextRequest): 'TR' | 'GLOBAL' {
  // 1. Check if user already has a preference
  const marketCookie = request.cookies.get('market')?.value;
  if (marketCookie === 'TR' || marketCookie === 'GLOBAL') {
    return marketCookie;
  }

  // 2. Check Vercel's geo header (automatic with Vercel)
  const country = request.headers.get('x-vercel-ip-country');
  if (country === 'TR') {
    return 'TR';
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.toLowerCase().startsWith('tr')) {
    return 'TR';
  }

  return 'GLOBAL';
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  
  // Market detection for store pages
  if (!request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/login')) {
    const market = detectMarket(request);
    
    // Set market cookie if not exists
    if (!request.cookies.get('market')) {
      supabaseResponse.cookies.set('market', market, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if user has admin role
    const { data: customer } = await supabase
      .from('customers')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const adminRoles = ['admin', 'sales', 'production', 'warehouse'];
    if (!customer || !adminRoles.includes(customer.role)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - api routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/public).*)',
  ],
};
