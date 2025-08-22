window.API_GAS = (() => {
  async function post(payload) {
    const res = await fetch(window.CONFIG.gas.url, {
      method: 'POST',
      body: JSON.stringify(payload) // no custom headers (avoid preflight)
    });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { ok: res.ok, message: txt }; }
  }
  return {
    async register({ email, name, age, category, open }) {
      return post({ action: 'register', email, name, age, category, open });
    },
    async yap({ email, name, category, open, minAge, maxAge }) {
      return post({ action: 'yap', email, name, category, open, minAge, maxAge });
    }
  };
})();
