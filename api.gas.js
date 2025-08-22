// api.gas.js — client-side bridge to your GAS Web App

(() => {
  async function post(payload) {
    const res = await fetch(window.CONFIG.gas.url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch (_) { return { ok: res.ok, message: txt }; }
  }

  function register({ email, name, age, category, open, gender, sameSex }) {
    return post({ action: 'register', email, name, age, category, open, gender, sameSex });
  }

  function yap({ email, name, category, open, minAge, maxAge, sameSex, userGender, groupMin, groupMax }) {
    return post({ action: 'yap', email, name, category, open, minAge, maxAge, sameSex, userGender, groupMin, groupMax });
  }

  function stats({ email, month, category = 'all' }) {
    return post({ action: 'stats', email, month, category });
  }

  // <-- This is the counts call the header uses
  function counts({ excludeEmail, minAge, maxAge, userGender, sameSex }) {
    return post({ action: 'openCounts', excludeEmail, minAge, maxAge, userGender, sameSex });
  }

  const api = { register, yap, stats, counts };

  // Expose under both names so UI can call window.API or window.API_GAS
  window.API_GAS = api;
  window.API = window.API || api;
})();
