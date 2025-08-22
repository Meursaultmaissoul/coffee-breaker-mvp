window.API_GAS = (() => {
  async function post(payload) {
    const res = await fetch(window.CONFIG.gas.url, {
      method: 'POST',
      // no custom headers -> avoids CORS preflight
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { ok: res.ok, message: txt }; }
  }
  return {
    async register({ email, name, open }) {
      return post({ action: 'register', email, name, open });
    },
    async yap({ email, name, open }) {
      return post({ action: 'yap', email, name, open });
    }
  };
})();
