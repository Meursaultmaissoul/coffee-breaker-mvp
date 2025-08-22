// ===== utils =====
function q(id){ return document.getElementById(id); }
function getQuery(key){ return new URLSearchParams(location.search).get(key); }
function setText(id, s){ const el=q(id); if(el) el.textContent=s; }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

// ===== elements =====
const emailEl=q('email'), nameEl=q('name'), ageEl=q('age');
const openEl=q('open'), saveBtn=q('save'), yapBtn=q('yap');
const saveMsg=q('saveMsg'), statusMsg=q('statusMsg'), yapMsg=q('yapMsg');

// dual range (status)
const ageMin=q('ageMin'), ageMax=q('ageMax'), fillStatus=q('fillStatus'), ageRangeLabel=q('ageRangeLabel');
const statusRangeWrap = q('statusRange');
// dual range (yap)
const ageMinY=q('ageMinYap'), ageMaxY=q('ageMaxYap'), fillYap=q('fillYap'), ageRangeLabelY=q('ageRangeLabelYap');
const yapRangeWrap = q('yapRange');

// counts
const countCoffee = q('countCoffee'), countLunch = q('countLunch'), countZanpan = q('countZanpan');

// group size UI
const groupRow = q('groupRow'), groupHint = q('groupHint');
const grpMinus = q('grpMinus'), grpPlus = q('grpPlus'), grpSizeVal = q('grpSizeVal');

// ===== category =====
const CATEGORY_MAP = {
  coffee: { title:'☕ Coffee Break', word:'Coffee' },
  lunch:  { title:'🍱 Lunch Break',  word:'Lunch'  },
  zanpan: { title:'🍚 残飯（残業ごはん）', word:'残飯' }
};
let category = getQuery('cat') || localStorage.getItem('cm_category') || 'coffee';
if(!CATEGORY_MAP[category]) category='coffee';
localStorage.setItem('cm_category', category);
setText('appTitle', CATEGORY_MAP[category].title);
setText('catLabel', CATEGORY_MAP[category].word);
setText('catWord1', CATEGORY_MAP[category].word);
q('yapHeader').textContent = `3) ${CATEGORY_MAP[category].word} Now`;

// ===== local init =====
(() => {
  emailEl.value = localStorage.getItem('cm_email') || '';
  nameEl.value  = localStorage.getItem('cm_name')  || '';
  ageEl.value   = localStorage.getItem('cm_age')   || '';
  openEl.checked = localStorage.getItem(`cm_open_${category}`) === '1';

  const amin = +(localStorage.getItem('cm_ageMin') || 20);
  const amax = +(localStorage.getItem('cm_ageMax') || 60);
  setDual(ageMin, ageMax, fillStatus, ageRangeLabel, amin, amax);
  setDual(ageMinY, ageMaxY, fillYap, ageRangeLabelY, amin, amax);
})();

function persistLocal(){
  localStorage.setItem('cm_email', emailEl.value.trim());
  localStorage.setItem('cm_name',  nameEl.value.trim());
  localStorage.setItem('cm_age',   ageEl.value.trim());
  localStorage.setItem(`cm_open_${category}`, openEl.checked ? '1':'0');
}

// ===== dual-range (independent ends) =====
function setDual(minEl, maxEl, fillEl, labelEl, a, b){
  let min = Math.min(a,b), max = Math.max(a,b);
  const lo=+minEl.min, hi=+minEl.max;
  min = clamp(min, lo, hi); max = clamp(max, lo, hi);
  minEl.value=min; maxEl.value=max;

  const pctL = ((min-lo)/(hi-lo))*100;
  const pctR = ((max-lo)/(hi-lo))*100;
  fillEl.style.left  = pctL + '%';
  fillEl.style.right = (100 - pctR) + '%';
  if (labelEl) labelEl.textContent = `${min}-${max}`;

  localStorage.setItem('cm_ageMin', min);
  localStorage.setItem('cm_ageMax', max);
}
function attachDual(container, minEl, maxEl, fillEl, labelEl, onChange){
  const refresh = () => { setDual(minEl, maxEl, fillEl, labelEl, +minEl.value, +maxEl.value); onChange && onChange(); };
  minEl.oninput = refresh;
  maxEl.oninput = refresh;

  const rectToVal = (clientX) => {
    const rect = container.getBoundingClientRect();
    const lo=+minEl.min, hi=+minEl.max;
    const pct = clamp((clientX - rect.left)/rect.width, 0, 1);
    return Math.round(lo + pct*(hi-lo));
  };
  let active = null; // 'min' or 'max'
  const pick = (val) => (Math.abs(val - +minEl.value) <= Math.abs(val - +maxEl.value)) ? 'min' : 'max';
  const setVal = (val) => {
    if (active === 'min') minEl.value = Math.min(val, +maxEl.value);
    else if (active === 'max') maxEl.value = Math.max(val, +minEl.value);
    refresh();
  };
  const down = (e)=>{
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const val = rectToVal(x);
    active = pick(val);
    setVal(val);
    e.preventDefault();
  };
  const move = (e)=>{
    if(!active) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setVal(rectToVal(x));
    e.preventDefault();
  };
  const up = ()=>{ active=null; };
  container.addEventListener('pointerdown', down);
  container.addEventListener('pointermove', move);
  container.addEventListener('pointerup', up);
  container.addEventListener('pointercancel', up);
  container.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  container.addEventListener('touchstart', down, {passive:false});
  container.addEventListener('touchmove', move, {passive:false});
  container.addEventListener('touchend', up);
}

// hook up the sliders
attachDual(statusRangeWrap, ageMin,  ageMax,  fillStatus, ageRangeLabel,   () => { saveProfile(statusMsg); refreshOpenCounts(); });
attachDual(yapRangeWrap,    ageMinY, ageMaxY, fillYap,    ageRangeLabelY);

// ===== group size logic =====
const GROUP_MIN = 2, GROUP_MAX = 6;
let groupSize = parseInt(localStorage.getItem(`cm_group_${category}`) || (category==='coffee'?1:2), 10);
function updateGroupUI(){
  if(category === 'coffee'){
    groupRow.style.display = 'none';
    groupHint.style.display = 'none';
    groupSize = 1;
  } else {
    groupRow.style.display = 'flex';
    groupHint.style.display = 'block';
    groupSize = clamp(groupSize || 2, GROUP_MIN, GROUP_MAX);
    grpSizeVal.textContent = String(groupSize);
  }
  localStorage.setItem(`cm_group_${category}`, groupSize);
}
grpMinus.onclick = ()=>{ if(category!=='coffee'){ groupSize = Math.max(GROUP_MIN, groupSize-1); grpSizeVal.textContent=groupSize; localStorage.setItem(`cm_group_${category}`, groupSize); } };
grpPlus.onclick  = ()=>{ if(category!=='coffee'){ groupSize = Math.min(GROUP_MAX, groupSize+1); grpSizeVal.textContent=groupSize; localStorage.setItem(`cm_group_${category}`, groupSize); } };
updateGroupUI();

// ===== API helpers =====
async function saveProfile(showEl) {
  const email=emailEl.value.trim(), name=nameEl.value.trim();
  if(!email || !name){ showEl.textContent='Fill Email + Name first.'; showEl.className='hint err'; return; }
  const age = ageEl.value ? parseInt(ageEl.value,10) : null;
  try{
    showEl.textContent='Saving…'; showEl.className='hint';
    persistLocal();
    const res = await window.API.register({ email, name, age, category, open: openEl.checked });
    showEl.textContent = res.message || 'Saved.'; showEl.className='hint ok';
    refreshOpenCounts();
  }catch(e){
    showEl.textContent = e.message || 'Failed.'; showEl.className='hint err';
  }
}

// ===== events =====
saveBtn.onclick = () => saveProfile(saveMsg);
openEl.onchange = () => saveProfile(statusMsg);

// ===== counts row =====
async function refreshOpenCounts(){
  const email = emailEl.value.trim();
  const minAge = Math.min(+ageMin.value, +ageMax.value);
  const maxAge = Math.max(+ageMin.value, +ageMax.value);
  try{
    const res = await window.API.counts({ excludeEmail: email || null, minAge, maxAge });
    const d = res.data || {};
    if (countCoffee) countCoffee.textContent = d.coffee ?? 0;
    if (countLunch)  countLunch.textContent  = d.lunch  ?? 0;
    if (countZanpan) countZanpan.textContent = d.zanpan ?? 0;
  }catch(_){}
}
window.addEventListener('load', refreshOpenCounts);
emailEl.addEventListener('blur', refreshOpenCounts);

// ===== Ping Now =====
yapBtn.onclick = async () => {
  const email=emailEl.value.trim(), name=nameEl.value.trim();
  if(!email || !name){ yapMsg.textContent='Fill Email + Name first.'; yapMsg.className='hint err'; return; }
  const minAge = Math.min(+ageMinY.value, +ageMaxY.value);
  const maxAge = Math.max(+ageMinY.value, +ageMaxY.value);
  const gs = (category==='coffee') ? 1 : clamp(groupSize||2, GROUP_MIN, GROUP_MAX);
  try{
    yapMsg.textContent='Sending…'; yapMsg.className='hint';
    persistLocal();
    const res = await window.API.yap({ email, name, category, open: openEl.checked, minAge, maxAge, groupSize: gs });
    yapMsg.textContent = res.message || 'Sent.'; yapMsg.className='hint ok';
  }catch(e){
    yapMsg.textContent = e.message || 'Failed.'; yapMsg.className='hint err';
  }
};

// ===== calendar =====
const calTitle = q('calTitle'), calGrid=q('calGrid');
const calPrev  = q('calPrev'),  calNext = q('calNext');
let calYear, calMonth; // 1..12
function setMonth(y,m){ calYear=y; calMonth=m; }
(function initMonth(){ const d=new Date(); setMonth(d.getFullYear(), d.getMonth()+1); })();

function ymKey(y,m){ return `${y}-${String(m).padStart(2,'0')}`; }
function monthDays(y,m){
  const first = new Date(y,m-1,1);
  const last  = new Date(y,m,0).getDate();
  const startDow = first.getDay();
  return { last, startDow };
}
async function fetchStats(year,month){
  const email = emailEl.value.trim();
  if(!email) return {};
  try{
    const res = await window.API.stats({ email, month: ymKey(year,month), category:'all' });
    return res.data || {};
  }catch{ return {}; }
}
async function renderCalendar(){
  const {last, startDow} = monthDays(calYear, calMonth);
  calTitle.textContent = `${calYear}-${String(calMonth).padStart(2,'0')}`;
  calGrid.innerHTML = '';

  const stats = await fetchStats(calYear, calMonth);

  for(let i=0;i<startDow;i++){
    const cell=document.createElement('div'); cell.className='cal-cell'; calGrid.appendChild(cell);
  }
  const monthStr = ymKey(calYear, calMonth);
  for(let d=1; d<=last; d++){
    const dateStr = `${monthStr}-${String(d).padStart(2,'0')}`;
    const cell=document.createElement('div'); cell.className='cal-cell';
    const dn=document.createElement('div'); dn.className='cal-daynum'; dn.textContent=d;
    const em=document.createElement('div'); em.className='cal-emojis';
    const day = stats[dateStr] || {};
    let s='';
    if(day.coffee) s += ' ' + '☕'.repeat(Math.min(day.coffee, 6));
    if(day.lunch)  s += ' ' + '🍱'.repeat(Math.min(day.lunch,  6));
    if(day.zanpan) s += ' ' + '🍚'.repeat(Math.min(day.zanpan, 6));
    em.textContent = s.trim();
    cell.appendChild(dn); cell.appendChild(em);
    calGrid.appendChild(cell);
  }
}
calPrev.onclick = async ()=>{ if(--calMonth<1){calMonth=12;calYear--;} await renderCalendar(); };
calNext.onclick = async ()=>{ if(++calMonth>12){calMonth=1; calYear++;} await renderCalendar(); };
window.addEventListener('load', renderCalendar);
