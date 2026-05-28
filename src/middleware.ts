import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Detect REGION based on IP location (NOT changeable by user)
// This determines: price, shipping, payment
// EXCEPTION: Admins can override via URL param or cookie
function detectRegion(request: NextRequest, isAdmin: boolean): 'TR' | 'GLOBAL' {
  // Admin override via URL parameter: ?_region=GLOBAL or ?_region=TR
  const urlRegion = request.nextUrl.searchParams.get('_region');
  if (isAdmin && urlRegion && (urlRegion === 'TR' || urlRegion === 'GLOBAL')) {
    return urlRegion;
  }
  
  // Admin override via cookie (set from previous URL param)
  const adminRegionOverride = request.cookies.get('admin_region_override')?.value;
  if (isAdmin && adminRegionOverride && (adminRegionOverride === 'TR' || adminRegionOverride === 'GLOBAL')) {
    return adminRegionOverride;
  }
  
  // Normal users: Region is ONLY based on IP
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

  // Only do full auth check for admin routes (saves 200-500ms on store pages)
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  
  let user = null;
  let isAdmin = false;
  
  if (isAdminRoute) {
    // Full auth check only for admin routes
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
    
    if (user) {
      const { data: customer } = await supabase
        .from('customers')
        .select('role')
        .eq('id', user.id)
        .single();
      
      const adminRoles = ['admin', 'sales', 'production', 'warehouse'];
      isAdmin = !!(customer && adminRoles.includes(customer.role));
    }
    
    // Protect admin routes
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } else {
    // For store pages, just refresh the session without full auth check
    // This is lightweight - just refreshes cookies if needed
    await supabase.auth.getUser();
  }

  // Region & Locale detection for store pages
  if (!isAdminRoute && 
      !request.nextUrl.pathname.startsWith('/api') &&
      !request.nextUrl.pathname.startsWith('/login')) {
    
    // Check for admin override via URL params
    const urlRegion = request.nextUrl.searchParams.get('_region');
    const urlLocale = request.nextUrl.searchParams.get('_locale');
    
    // Region detection (admin can override)
    const region = detectRegion(request, isAdmin);
    supabaseResponse.cookies.set('region', region, {
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    });
    
    // If admin used URL override, save it to cookie for persistence
    if (isAdmin && urlRegion && (urlRegion === 'TR' || urlRegion === 'GLOBAL')) {
      supabaseResponse.cookies.set('admin_region_override', urlRegion, {
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
        sameSite: 'lax',
      });
    }
    
    // Locale (user can always change, admin can override via URL)
    if (isAdmin && urlLocale && (urlLocale === 'tr' || urlLocale === 'en')) {
      supabaseResponse.cookies.set('locale', urlLocale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    } else if (!request.cookies.get('locale')) {
      const locale = detectInitialLocale(request);
      supabaseResponse.cookies.set('locale', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
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
