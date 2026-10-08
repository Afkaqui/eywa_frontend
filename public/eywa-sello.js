/*
 * Sello EYWA para la web de una empresa (PENDIENTES §9).
 *
 *   <script src="https://eywa-hazel.vercel.app/eywa-sello.js" data-empresa="SLUG" async></script>
 *
 * Muestra el perfil público de la empresa en EYWA y cuánto tiene documentado en
 * su dataroom, con enlace a la página pública. Nada más: no muestra el puntaje
 * GENES (la página pública tampoco) ni dice "certificado", porque no lo es.
 *
 * Reglas de un script que vive en webs ajenas:
 *  - Nunca rompe la página: cualquier fallo deja el hueco vacío, sin errores.
 *  - Shadow DOM: los estilos de la web no deforman el sello ni al revés.
 *  - Sin cookies ni rastreo: una sola petición GET a datos que ya son públicos.
 */
(function () {
  'use strict';

  var scripts = document.querySelectorAll('script[data-empresa]:not([data-eywa-listo])');
  if (!scripts.length) return;

  scripts.forEach(function (script) {
    script.setAttribute('data-eywa-listo', '1');
    try { pintar(script); } catch (e) { /* silencio: nunca romper la web anfitriona */ }
  });

  function pintar(script) {
    var slug = (script.getAttribute('data-empresa') || '').trim();
    if (!/^[a-z0-9-]+$/i.test(slug)) return;

    var origen = new URL(script.src, location.href).origin;
    var anfitrion = document.createElement('span');
    anfitrion.style.display = 'inline-block';
    script.parentNode.insertBefore(anfitrion, script.nextSibling);
    var raiz = anfitrion.attachShadow ? anfitrion.attachShadow({ mode: 'open' }) : anfitrion;

    fetch(origen + '/api/public/v1/empresas/' + encodeURIComponent(slug))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.empresa) raiz.appendChild(construir(d, origen)); })
      .catch(function () {});
  }

  function el(tag, estilo, texto) {
    var n = document.createElement(tag);
    if (estilo) n.setAttribute('style', estilo);
    if (texto != null) n.textContent = texto; // textContent: nada del servidor se interpreta como HTML
    return n;
  }

  function construir(d, origen) {
    var pct = Math.max(0, Math.min(100, Number(d.completitud_dataroom && d.completitud_dataroom.porcentaje) || 0));
    var nombre = d.empresa.nombre_comercial || d.empresa.razon_social || '';

    var a = el('a',
      'display:inline-flex;align-items:center;gap:10px;padding:8px 12px 8px 8px;border:1px solid #a7f3d0;' +
      'border-radius:12px;background:#fff;text-decoration:none;color:#111827;' +
      'font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;line-height:1.2;' +
      'box-shadow:0 1px 2px rgba(0,0,0,.04);max-width:320px');
    var url = String(d.empresa.url_perfil || '');
    if (!/^https:\/\//.test(url)) url = origen + '/empresa/' + encodeURIComponent(d.empresa.slug || '');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.title = d.aviso || '';

    // Marca: logo + wordmark + tagline (identidad EYWA).
    var logo = el('img', 'width:30px;height:30px;object-fit:contain;flex-shrink:0');
    logo.src = origen + '/logo.png';
    logo.alt = 'EYWA';
    a.appendChild(logo);

    var col = el('span', 'display:flex;flex-direction:column;min-width:0');
    var marca = el('span', 'display:flex;align-items:baseline;gap:6px');
    marca.appendChild(el('span', 'font-weight:800;font-size:13px;letter-spacing:.3px', 'EYWA'));
    marca.appendChild(el('span', 'font-size:8px;font-weight:600;letter-spacing:1px;color:#059669', 'ORQUESTACIÓN DE ECOSISTEMAS'));
    col.appendChild(marca);

    col.appendChild(el('span',
      'font-size:12px;color:#374151;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis',
      'Perfil verificable de ' + nombre));

    var barra = el('span', 'display:flex;align-items:center;gap:6px;margin-top:5px');
    var fondo = el('span', 'display:inline-block;width:90px;height:5px;border-radius:999px;background:#d1fae5;overflow:hidden');
    fondo.appendChild(el('span', 'display:block;height:100%;width:' + pct + '%;background:#059669'));
    barra.appendChild(fondo);
    barra.appendChild(el('span', 'font-size:11px;color:#065f46;font-weight:600', pct + '% documentado'));
    col.appendChild(barra);

    a.appendChild(col);
    return a;
  }
})();
