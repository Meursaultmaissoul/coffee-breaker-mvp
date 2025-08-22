// ===== Helpers =====
function getQuery(key){ return new URLSearchParams(location.search).get(key); }
function setText(id, s){ const el=document.getElementById(id); if(el) el.textContent=s; }

// ===== Elements =====
const emailEl = document.getElementById('email');
const nameEl  = document.getElementById('name');
const ageEl   = document.getElementById('age');
const openEl  = document.getElementById('open');
const saveBtn = document.getElementById('save');
const yapBtn  = document.getElementById('yap');
const saveMsg = document.getElementById('saveMsg');
const statusMsg = document.getElementById('statusMsg');
const yapMsg  = document.getElementById('yapMsg');

// age range (Status)
const ageMin = document.getElementById('ageMin');
const ageMax = document.getElementById('ageMax');
const ageRangeLabel = document.getElementById('ageRangeLabel');
// age range (Yap)
const ageMinY = document.getElementById('ageMinYap');
const ageMaxY = document.getElementById('ageMaxYap');
const ageRangeLabelY = document.getElementById('ageRangeLabelYap');

// ===== Category setup =====
const CATEGORY_MAP = {
  coffee: { title:'☕ Coffee Break', word:'Coffee' },
  lunch:  { title:'🍱 Lunch Break',  word:'Lunch'  },
  zanpan: { title:'🍚 残飯（残業ごはん）', word:'残飯' }
};
let category = getQuery('cat') || localStorage.getItem('cm_category') || 'coffee';
if(!CATEGORY_MAP[category]) category = 'coffee';
localStorage.setItem('cm_category', category);

// UI text swaps
setText('appTitle', CATEGORY_MAP[category].title);
setText('catLabel', CATEGORY_MAP[category].word);
setText('catWord1', CATEGORY_MAP[category].word);
document.getElementById('yapHeader').textContent = `3) ${CATEGORY_MAP[category].word} Now`;

// ===== Prefill local =====
(() => {
  emailEl.value = localStorage.getItem('cm_email') || '';
  nameEl.value  = localStorage.getItem('cm_name')  || '';
  ageEl.value   = localStorage.getItem('cm_age')   || '';
  openEl.checked = localStorage.getItem(`cm_open_${category}`) === '1';

  // ranges (shared defaults)
  const min = +(localStorage.getItem('cm_ageMin') || 20);
  const max = +(localStorage.getItem('cm_ageMax') || 60);
  ageMin.value=min; ageMax.value=max;
  ageMinY.value=min; ageMaxY.value=max;
  ageRangeLabel.textContent = `${min}–${max}`;
  ageRangeLabelY.textContent = `${min}–${max}`;
})();
function persistLocal() {
  localStorage.setItem('cm_email', emailEl.value.trim());
  localStorage.setItem('cm_name',  nameEl.value.trim());
  localStorage.setItem('cm_age',   ageEl.value.trim());
  localStorage.setItem(`cm_open_${category}`, openEl.checked ? '1' : '0');
}
function saveRanges(min, max) {
  const a = Math.min(+min.value, +max.value);
  const b = Math.max(+min.value, +max.value);
  min.value=a; max.value=b;
  localStorage.setItem('cm_ageMin', a);
  localStorage.setItem('cm_ageMax', b);
  ageRangeLabel.textContent = `${ageMin.value}–${ageMax.value}`;
  ageRangeLabelY.textContent = `${ageMinY.value}–${ageMaxY.value}`;
  // keep both sliders in sync
  if(min===ageMin){ ageMinY.value=a; ageMaxY.value=b; }
  else { ageMin.value=a; ageMax.value=b; }
}

// ===== Save Profile =====
async function saveProfile(showEl) {
  const email = emailEl.value.trim(), name = nameEl.value.trim();
  if (!email || !name) { showEl.textContent = 'Fill Email + Name first.'; showEl.className='hint err'; return; }
  const age = ageEl.value ? parseInt(ageEl.value,10) : null;
  try {
    showEl.textContent = 'Saving…'; showEl.className='hint';
    persistLocal();
    const res = await window.API.register({
      email, name, age, category, open: openEl.checked
    });
    showEl.textContent = res.message || 'Saved.'; showEl.className='hint ok';
  } catch (e) {
    showEl.textContent = e.message || 'Failed.'; showEl.className='hint err';
  }
}

// ===== Events =====
saveBtn.onclick = () => saveProfile(saveMsg);
openEl.onchange = () => saveProfile(statusMsg);
ageMin.oninput = () => saveRanges(ageMin, ageMax);
ageMax.oninput = () => saveRanges(ageMin, ageMax);
ageMinY.oninput = () => saveRanges(ageMinY, ageMaxY);
ageMaxY.oninput = () => saveRanges(ageMinY, ageMaxY);

document.getElementById('yap').onclick = async () => {
  const email = emailEl.value.trim(), name = nameEl.value.trim();
  if (!email || !name) { yapMsg.textContent = 'Fill Email + Name first.'; yapMsg.className='hint err'; return; }
  const minAge = Math.min(+ageMinY.value, +ageMaxY.value);
  const maxAge = Math.max(+ageMinY.value, +ageMaxY.value);
  try {
    yapMsg.textContent = 'Sending…'; yapMsg.className='hint';
    persistLocal();
    const res = await window.API.yap({
      email, name, category, open: openEl.checked, minAge, maxAge
    });
    yapMsg.textContent = res.message || 'Sent.'; yapMsg.className='hint ok';
  } catch (e) {
    yapMsg.textContent = e.message || 'Failed.'; yapMsg.className='hint err';
  }
};


