// Elements
const emailEl = document.getElementById('email');
const nameEl  = document.getElementById('name');
const openEl  = document.getElementById('open');
const saveBtn = document.getElementById('save');
const yapBtn  = document.getElementById('yap');
const saveMsg = document.getElementById('saveMsg');
const statusMsg = document.getElementById('statusMsg');
const yapMsg  = document.getElementById('yapMsg');

// Prefill local
(() => {
  emailEl.value = localStorage.getItem('cm_email') || '';
  nameEl.value  = localStorage.getItem('cm_name')  || '';
  openEl.checked = localStorage.getItem('cm_open') === '1';
})();
function persistLocal() {
  localStorage.setItem('cm_email', emailEl.value.trim());
  localStorage.setItem('cm_name',  nameEl.value.trim());
  localStorage.setItem('cm_open', openEl.checked ? '1' : '0');
}

async function saveProfile(showEl) {
  const email = emailEl.value.trim(), name = nameEl.value.trim();
  if (!email || !name) { showEl.textContent = 'Fill Email + Name first.'; showEl.className='hint err'; return; }
  try {
    showEl.textContent = 'Saving…'; showEl.className='hint';
    persistLocal();
    const res = await window.API.register({ email, name, open: openEl.checked });
    showEl.textContent = res.message || 'Saved.'; showEl.className='hint ok';
  } catch (e) {
    showEl.textContent = e.message || 'Failed.'; showEl.className='hint err';
  }
}

// Events
saveBtn.onclick = () => saveProfile(saveMsg);
openEl.onchange = () => saveProfile(statusMsg);

yapBtn.onclick = async () => {
  const email = emailEl.value.trim(), name = nameEl.value.trim();
  if (!email || !name) { yapMsg.textContent = 'Fill Email + Name first.'; yapMsg.className='hint err'; return; }
  try {
    yapMsg.textContent = 'Sending…'; yapMsg.className='hint';
    persistLocal();
    const res = await window.API.yap({ email, name, open: openEl.checked });
    yapMsg.textContent = res.message || 'Sent.'; yapMsg.className='hint ok';
  } catch (e) {
    yapMsg.textContent = e.message || 'Failed.'; yapMsg.className='hint err';
  }
};
