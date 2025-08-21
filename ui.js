const emailEl = document.getElementById('email');
const nameEl = document.getElementById('name');
const openEl = document.getElementById('open');
const saveBtn = document.getElementById('save');
const yapBtn = document.getElementById('yap');
const saveMsg = document.getElementById('saveMsg');
const yapMsg = document.getElementById('yapMsg');

// Prefill from local storage
(() => {
    emailEl.value = localStorage.getItem('cm_email') || '';
    nameEl.value = localStorage.getItem('cm_name') || '';
    openEl.checked = localStorage.getItem('cm_open') === '1';
})();
function persistLocal() {
    localStorage.setItem('cm_email', emailEl.value.trim());
    localStorage.setItem('cm_name', nameEl.value.trim());
    localStorage.setItem('cm_open', openEl.checked ? '1' : '0');
}

saveBtn.onclick = async () => {
    const email = emailEl.value.trim(), name = nameEl.value.trim();
    if (!email || !name) { saveMsg.textContent = 'Email + Name required.'; saveMsg.className = 'hint err'; return; }
    try {
        saveMsg.textContent = 'Saving…'; saveMsg.className = 'hint';
        persistLocal();
        const res = await window.API.register({ email, name, open: openEl.checked });
        saveMsg.textContent = res.message || 'Saved.'; saveMsg.className = 'hint ok';
    } catch (e) {
        saveMsg.textContent = e.message || 'Failed.'; saveMsg.className = 'hint err';
    }
};

yapBtn.onclick = async () => {
    const email = emailEl.value.trim(), name = nameEl.value.trim();
    if (!email || !name) { yapMsg.textContent = 'Fill Email + Name first.'; yapMsg.className = 'hint err'; return; }
    try {
        yapMsg.textContent = 'Sending…'; yapMsg.className = 'hint';
        persistLocal();
        const res = await window.API.yap({ email, name, open: openEl.checked });
        yapMsg.textContent = res.message || 'Sent.'; yapMsg.className = 'hint ok';
    } catch (e) {
        yapMsg.textContent = e.message || 'Failed.'; yapMsg.className = 'hint err';
    }
};
