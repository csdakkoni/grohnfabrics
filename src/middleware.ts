import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Detect REGION based on IP location (NOT changeable by user)
// This determines: price, shipping, payment
function detectRegion(request: NextRequest): 'TR' | 'GLOBAL' {
  // Region is ONLY based on IP - user cannot change this
  // Check Vercel's geo header (automatic with Vercel)
  const country = request.headers.get('x-vercel-ip-country');
  if (country === 'TR') {
    return 'TR';
  }
  
  return 'GLOBAL';
}

// Detect initial LOCALE preference (user CAN change this later)
// This determines: UI language only
function detectInitialLocale(request: NextRequest): 'tr' | 'en' {
  // 1. Check if user already has a preference
  const localeCookie = request.cookies.get('locale')?.value;
  if (localeCookie === 'tr' || localeCookie === 'en') {
    return localeCookie;
  }

  // 2. Check Accept-Language header for initial preference
  const acceptLanguage = request.headers.get('accept-language') || '';
  if (acceptLanguage.toLowerCase().startsWith('tr')) {
    return 'tr';
  }

  return 'en';
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });
  
  // Region & Locale detection for store pages
  if (!request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/login')) {
    
    // Region is ALWAYS set based on IP (not user preference)
    const region = detectRegion(request);
    supabaseResponse.cookies.set('region', region, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day (refresh daily in case of travel)
      sameSite: 'lax',
    });
    
    // Locale is set only if not already set (user can change later)
    if (!request.cookies.get('locale')) {
      const locale = detectInitialLocale(request);
      supabaseResponse.cookies.set('locale', locale, {
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
