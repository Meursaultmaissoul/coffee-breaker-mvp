window.CONFIG = {
    mode: 'gas', // 'gas' now, switch to 'auto' later
    gas: {
        url: 'https://script.google.com/macros/s/AKfycbypx_biZEjw222Szshr5CwoKmvwZvTkYep4Ha2yzi8bQf_P3XtWBJeTbdcm7gQyHSJt/exec' // <- your Web App URL
    },
    auto: {
        // (Later) Firebase web config + hostingBaseUrl
    }
};
window.API = (window.CONFIG.mode === 'gas') ? window.API_GAS : window.API_AUTO;
