// ===== UI ELEMENTS =====
const emailEl = document.getElementById('email');
const nameEl  = document.getElementById('name');
const openEl  = document.getElementById('open');        // from your status section
const acceptingEl = document.getElementById('accepting'); // NEW toggle
const saveBtn = document.getElementById('save');
const yapBtn  = document.getElementById('yap');
const saveMsg = document.getElementById('saveMsg');
const yapMsg  = document.getElementById('yapMsg');

// ===== LOCAL PREFILL =====
(() => {
  emailEl.value = localStorage.getItem('cm_email') || '';
  nameEl.value  = localStorage.getItem('cm_name')  || '';
  if (openEl) openEl.checked = localStorage.getItem('cm_open') === '1';
  acceptingEl.checked = (localStorage.getItem('cm_accepting') !== '0'); // default true
})();
function persistLocal() {
  localStorage.setItem('cm_email', emailEl.value.trim());
  localStorage.setItem('cm_name',  nameEl.value.trim());
  if (openEl) localStorage.setItem('cm_open', openEl.checked ? '1' : '0');
  localStorage.setItem('cm_accepting', acceptingEl.checked ? '1' : '0');
}

// ===== EVENTS =====
saveBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const name  = nameEl.value.trim();
  if (!email || !name) { saveMsg.textContent = 'Email + Name required.'; saveMsg.className='hint err'; return; }
  try {
    saveMsg.textContent = 'Saving…'; saveMsg.className='hint';
    persistLocal();
    const res = await window.API.register({
      email, name,
      open: openEl ? openEl.checked : false,
      accepting: acceptingEl.checked
    });
    saveMsg.textContent = res.message || 'Saved.'; saveMsg.className='hint ok';
  } catch (e) {
    saveMsg.textContent = e.message || 'Failed.'; saveMsg.className='hint err';
  }
};

yapBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const name  = nameEl.value.trim();
  if (!email || !name) { yapMsg.textContent = 'Fill Email + Name first.'; yapMsg.className='hint err'; return; }
  try {
    yapMsg.textContent = 'Sending…'; yapMsg.className='hint';
    persistLocal();
    const res = await window.API.yap({
      email, name,
      open: openEl ? openEl.checked : false,
      accepting: acceptingEl.checked
    });
    yapMsg.textContent = res.message || 'Sent.'; yapMsg.className='hint ok';
  } catch (e) {
    yapMsg.textContent = e.message || 'Failed.'; yapMsg.className='hint err';
  }
};
