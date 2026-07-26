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
    // Recuperación de contraseña: por definición el usuario NO puede iniciar
    // sesión, así que estas rutas y sus proxies tienen que ser públicas.
    '/recuperar', '/restablecer',
    '/api/proxy/auth/forgot-password', '/api/proxy/auth/reset-password',
    // Conteo de visitas: se dispara en TODA página, incluida la landing sin sesión.
    '/api/proxy/stats/visit',
    // Invitados al dataroom: llegan con el token del correo y NO tienen cuenta
    // (un inversor no se registra para revisar documentos en una due diligence).
    '/dataroom/invitacion', '/api/proxy/dataroom/invited',
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
