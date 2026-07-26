'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Registra una visita cuando cambia la ruta. Se monta una sola vez en el layout.
 *
 * No renderiza nada y nunca bloquea la página: el envío es "fire and forget" con
 * keepalive (así sobrevive si el usuario navega enseguida) y cualquier error se
 * traga en silencio — contar visitas no puede romperle la web a nadie.
 *
 * Privacidad: solo se manda la ruta y el referrer. El backend descarta el query
 * string, guarda del referrer únicamente el dominio, y no almacena IP ni
 * user-agent en claro (solo un hash diario para contar únicos).
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // No contamos las rutas internas de API ni los assets.
    if (pathname.startsWith('/api')) return;

    const payload = JSON.stringify({ path: pathname, referrer: document.referrer || '' });

    fetch('/api/proxy/stats/visit', {
      method:    'POST',
      headers:   { 'Content-Type': 'application/json' },
      body:      payload,
      keepalive: true,
    }).catch(() => { /* silencio deliberado */ });
  }, [pathname]);

  return null;
}
