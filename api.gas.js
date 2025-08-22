// api.gas.js
window.API_GAS = (() => {
  async function post(payload) {
    const res = await fetch(window.CONFIG.gas.url, { method: 'POST', body: JSON.stringify(payload) });
    const txt = await res.text(); try { return JSON.parse(txt); } catch { return { ok: res.ok, message: txt }; }
  }
  function register({ email, name, age, category, open }) {
    return post({ action: 'register', email, name, age, category, open });
  }
  function yap({ email, name, category, open, minAge, maxAge, groupSize }) {
    return post({ action: 'yap', email, name, category, open, minAge, maxAge, groupSize });
  }
  function stats({ email, month, category='all' }) {
    return post({ action: 'stats', email, month, category });
  }
  function counts({ excludeEmail, minAge, maxAge }) {
    return post({ action: 'openCounts', excludeEmail, minAge, maxAge });
  }
  return { register, yap, stats, counts };
})();
