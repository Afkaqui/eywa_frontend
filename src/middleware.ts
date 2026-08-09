import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// ── Gateo de rutas ──────────────────────────────────────────────────────────────
//
// Hasta el 2026-07-28 esto NO protegía nada: `publicPaths` incluía `'/'` y se
// comparaba con `startsWith`, así que TODA ruta empieza por `/` y `isPublic`
// siempre daba true. El redirect nunca se disparaba.
//
// No era un agujero de seguridad —las APIs del backend validan el JWT en cada
// petición y el `page.tsx` muestra el login si no hay sesión— pero daba una
// falsa sensación de protección y hacía decorativa esta lista.
//
// Ahora se separan las coincidencias EXACTAS de las de PREFIJO. Ese era el
// detalle que rompía todo: `/` solo puede ser exacta.
//
// ⚠️ Esta lista se enumeró revisando las páginas y los proxies reales. Si se
// agrega una página o un proxy público, hay que añadirlo AQUÍ o los visitantes
// sin sesión serán redirigidos al inicio.

/** Rutas públicas que deben coincidir EXACTAMENTE (sin sub-rutas). */
const PUBLIC_EXACT = new Set([
  '/',                 // landing
  '/login',
  '/register',
  '/recuperar',        // pedir enlace de recuperación
  '/restablecer',      // elegir contraseña nueva (el token va en el query)
  '/docs',
  '/fase1',
  '/infraestructura',  // sustentación pública (EINCUS-1-P-233-26)
]);

/** Rutas públicas con sub-rutas dinámicas: coinciden por PREFIJO. */
const PUBLIC_PREFIX = [
  '/api/auth',                    // next-auth (sesión, callbacks de OAuth)

  // Páginas públicas con parámetro
  '/simbio',                      // visor de simbiocreación compartida
  '/empresa',                     // mini-landing de empresa
  '/verificar',                   // verificación pública de certificados
  '/dataroom/invitacion',         // invitado al dataroom (llega con token, sin cuenta)

  // Proxies que NO llevan sesión (el backend valida lo que corresponde)
  '/api/proxy/auth/register',
  '/api/proxy/auth/forgot-password',
  '/api/proxy/auth/reset-password',
  '/api/proxy/certificates/verify',
  '/api/proxy/simbiocreacion/public',
  '/api/proxy/dataroom/public',
  '/api/proxy/dataroom/invited',
  '/api/proxy/stats/public',
  '/api/proxy/stats/visit',       // se dispara en CADA carga de página
];

/**
 * Logo y avatar SERVIDOS por id. Los consume un `<img>`, que nunca manda la
 * cabecera Authorization, así que tienen que ser públicos.
 *
 * Va como expresión regular y no como prefijo a propósito: un prefijo
 * `/api/proxy/media/organization/` también dejaría pasar `…/organization/logo`,
 * que es la ruta de SUBIDA y sí exige sesión. Aquí solo entran las variantes
 * con :id en medio.
 */
const PUBLIC_MEDIA = /^\/api\/proxy\/media\/(organization|profile)\/[^/]+\/(logo|avatar)$/;

function esPublica(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (PUBLIC_MEDIA.test(pathname)) return true;
  return PUBLIC_PREFIX.some((p) => pathname === p || pathname.startsWith(p));
}

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn && !esPublica(nextUrl.pathname)) {
    // Las llamadas de API NO se redirigen: un 307 hacia `/` les devolvería HTML
    // donde el cliente espera JSON, y `res.json()` reventaría con un error de
    // parseo en vez del mensaje real. Se responde 401, que es lo que el
    // repositorio del frontend ya sabe manejar (y lo mismo que devuelve el
    // backend, así que el comportamiento es consistente).
    if (nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|opengraph-image|.*\\.png$).*)'],
};
