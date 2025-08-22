window.API_GAS = (() => {
  async function post(payload) {
    const res = await fetch(window.CONFIG.gas.url, {
      method: 'POST',
      // no custom headers → avoids CORS preflight
      body: JSON.stringify(payload)
    });
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { ok: res.ok, message: txt }; }
  }

  async function register({ email, name, open = false, accepting = true }) {
    return post({ action: 'register', email, name, open, accepting });
  }

  async function yap({ email, name, open = false, accepting = true }) {
    return post({ action: 'yap', email, name, open, accepting });
  }

  return { register, yap };
})();

