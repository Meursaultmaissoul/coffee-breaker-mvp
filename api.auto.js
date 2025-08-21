window.API_AUTO = (() => ({
    async register() { throw new Error('Auto mode not enabled yet'); },
    async yap() { throw new Error('Auto mode not enabled yet'); }
}))();
