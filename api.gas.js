// api.gas.js
// Minimal adapter to your Google Apps Script Web App (/exec)

window.API_GAS = (() => {
  async function post(payload) {
    const res = await fetch(window.CONFIG.gas.url, {
      method: 'POST',
      // no custom headers to avoid CORS preflight
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { ok: res.ok, message: txt }; }
  }

  function register({ email, name, age, category, open }) {
    return post({ action: 'register', email, name, age, category, open });
  }

  function yap({ email, name, category, open, minAge, maxAge }) {
    return post({ action: 'yap', email, name, category, open, minAge, maxAge });
  }

  // NEW: monthly stats for the calendar
  function stats({ email, month, category = 'all' }) {
    // month must be 'YYYY-MM'
    return post({ action: 'stats', email, month, category });
  }

  return { register, yap, stats };
})();


