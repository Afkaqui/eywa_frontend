import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // Rutas públicas que no requieren autenticación.
  // /simbio/* = visor de enlaces compartidos; su proxy también debe ser público.
  // (Nota: '/' con startsWith hoy vuelve pública toda ruta — ver PENDIENTES;
  //  estas entradas dejan la intención explícita y sobreviven si se corrige.)
  const publicPaths = [
    '/', '/login', '/register', '/api/auth',
    '/simbio', '/api/proxy/simbiocreacion/public',
    '/empresa', '/api/proxy/dataroom/public', // mini-landing pública de empresa
  ];
  const isPublic = publicPaths.some((p) => nextUrl.pathname.startsWith(p));

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|opengraph-image|.*\\.png$).*)'],
};
