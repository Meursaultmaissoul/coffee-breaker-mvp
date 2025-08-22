// ===== utils =====
function q(id){ return document.getElementById(id); }
function getQuery(key){ return new URLSearchParams(location.search).get(key); }
function setText(id, s){ const el=q(id); if(el) el.textContent=s; }
function clamp(n,min,max){ return Math.max(min, Math.min(max, n)); }

// ===== elements =====
const emailEl=q('email'), nameEl=q('name'), ageEl=q('age');
const openEl=q('open'), sameSexPref=q('sameSex'), sameSexYap=q('sameSexYap');
const saveBtn=q('save'), yapBtn=q('yap');
const saveMsg=q('saveMsg'), statusMsg=q('statusMsg'), yapMsg=q('yapMsg');

// gender radios
const genderInputs = Array.from(document.querySelectorAll('input[name="gender"]'));

// dual range (status)
const ageMin=q('ageMin'), ageMax=q('ageMax'), fillStatus=q('fillStatus'), ageRangeLabel=q('ageRangeLabel');
const statusRangeWrap = q('statusRange');
// dual range (yap)
const ageMinY=q('ageMinYap'), ageMaxY=q('ageMaxYap'), fillYap=q('fillYap'), ageRangeLabelY=q('ageRangeLabelYap');
const yapRangeWrap = q('yapRange');

// group range
const groupBlock = q('groupBlock'), groupRangeWrap = q('groupRange');
const groupMin=q('groupMin'), groupMax=q('groupMax'), fillGroup=q('fillGroup'), groupRangeLabel=q('groupRangeLabel');
const groupTicks = q('groupTicks');

// counts
const countCoffee = q('countCoffee'), countLunch = q('countLunch'), countZanpan = q('countZanpan');

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

// ===== init =====
(() => {
  emailEl.value = localStorage.getItem('cm_email') || '';
  nameEl.value  = localStorage.getItem('cm_name')  || '';
  ageEl.value   = localStorage.getItem('cm_age')   || '';
  openEl.checked = localStorage.getItem(`cm_open_${category}`) === '1';

  // gender
  const g = localStorage.getItem('cm_gender') || '';
  genderInputs.forEach(r => r.checked = (r.value === g));

  // same-sex switches
  sameSexPref.checked = localStorage.getItem(`cm_same_${category}`) === '1';
  sameSexYap.checked  = localStorage.getItem('cm_same_yap') === '1';

  // ages
  const amin = +(localStorage.getItem('cm_ageMin') || 20);
  const amax = +(localStorage.getItem('cm_ageMax') || 60);
  setDual(ageMin, ageMax, fillStatus, ageRangeLabel, amin, amax);
  setDual(ageMinY, ageMaxY, fillYap, ageRangeLabelY, amin, amax);

  // group range defaults
  renderGroupTicks();
  const gmin = +(localStorage.getItem(`cm_gmin_${category}`) || 1);
  const gmax = +(localStorage.getItem(`cm_gmax_${category}`) || 3);
  setDual(groupMin, groupMax, fillGroup, groupRangeLabel, gmin, gmax, 1, 8, true);
  updateGroupUI();
})();

function persistLocal(){
  localStorage.setItem('cm_email', emailEl.value.trim());
  localStorage.setItem('cm_name',  nameEl.value.trim());
  localStorage.setItem('cm_age',   ageEl.value.trim());
  localStorage.setItem(`cm_open_${category}`, openEl.checked ? '1':'0');

  const gSel = (genderInputs.find(r => r.checked) || {}).value || '';
  localStorage.setItem('cm_gender', gSel);
  localStorage.setItem(`cm_same_${category}`, sameSexPref.checked ? '1':'0');
  localStorage.setItem('cm_same_yap', sameSexYap.checked ? '1':'0');
}

// ===== dual-range helpers =====
function setDual(minEl, maxEl, fillEl, labelEl, a, b, lo=null, hi=null, isGroup=false){
  lo = (lo==null)? +minEl.min : lo;
  hi = (hi==null)? +minEl.max : hi;

  let min = Math.min(a,b), max = Math.max(a,b);
  min = clamp(min, lo, hi); max = clamp(max, lo, hi);
  minEl.value=min; maxEl.value=max;

  const pctL = ((min-lo)/(hi-lo))*100;
  const pctR = ((max-lo)/(hi-lo))*100;
  fillEl.style.left  = pctL + '%';
  fillEl.style.right = (100 - pctR) + '%';
  if (labelEl) labelEl.textContent = `${min}-${max}`;

  if (isGroup) {
    localStorage.setItem(`cm_gmin_${category}`, min);
    localStorage.setItem(`cm_gmax_${category}`, max);
    paintGroupTicks(min, max);
  } else {
    localStorage.setItem('cm_ageMin', min);
    localStorage.setItem('cm_ageMax', max);
  }
}

function attachDual(container, minEl, maxEl, fillEl, labelEl, onChange, lo=null, hi=null, isGroup=false){
  const refresh = () => {
    setDual(minEl, maxEl, fillEl, labelEl, +minEl.value, +maxEl.value, lo, hi, isGroup);
    onChange && onChange();
  };
  minEl.oninput = refresh;
  maxEl.oninput = refresh;

  const rectToVal = (clientX) => {
    const rect = container.getBoundingClientRect();
    lo=(lo==null)? +minEl.min : lo; hi=(hi==null)? +minEl.max : hi;
    const pct = clamp((clientX - rect.left)/rect.width, 0, 1);
    const raw = lo + pct*(hi-lo);
    const val = Math.round(raw);
    return clamp(val, lo, hi);
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

// group ticks
function renderGroupTicks(){
  groupTicks.innerHTML = '';
  for(let i=1;i<=8;i++){
    const s=document.createElement('span');
    s.textContent = i%2===0 ? '🧑🏻' : '🧑🏽';
    groupTicks.appendChild(s);
  }
}
function paintGroupTicks(min,max){
  const spans = groupTicks.querySelectorAll('span');
  spans.forEach((sp,idx)=>{ const v=idx+1; sp.classList.toggle('on', v>=min && v<=max); });
}
function updateGroupUI(){
  const show = (category!=='coffee');
  groupBlock.style.display = show ? 'block' : 'none';
  if (!show) { setDual(groupMin, groupMax, fillGroup, groupRangeLabel, 1, 1, 1, 8, true); }
}

// ===== API helpers =====
async function saveProfile(showEl) {
  const email=emailEl.value.trim(), name=nameEl.value.trim();
  if(!email || !name){ showEl.textContent='Fill Email + Name first.'; showEl.className='hint err'; return; }
  const age = ageEl.value ? parseInt(ageEl.value,10) : null;
  const gender = (genderInputs.find(r=>r.checked)||{}).value || '';
  const same = !!sameSexPref.checked;
  try{
    showEl.textContent='Saving…'; showEl.className='hint';
    persistLocal();
    const res = await window.API.register({ email, name, age, category, open: openEl.checked, gender, sameSex: same });
    showEl.textContent = res.message || 'Saved.'; showEl.className='hint ok';
    refreshOpenCounts();
  }catch(e){
    showEl.textContent = e.message || 'Failed.'; showEl.className='hint err';
  }
}

// ===== events =====
saveBtn.onclick = () => saveProfile(saveMsg);
openEl.onchange = async () => { await saveProfile(statusMsg); refreshOpenCounts(); };
sameSexPref.onchange = () => saveProfile(statusMsg);
sameSexYap.onchange  = () => { persistLocal(); };

genderInputs.forEach(r => r.onchange = () => saveProfile(saveMsg));

// hook up sliders
attachDual(statusRangeWrap, ageMin,  ageMax,  fillStatus, ageRangeLabel,   () => { saveProfile(statusMsg); refreshOpenCounts(); });
attachDual(yapRangeWrap,    ageMinY, ageMaxY, fillYap,    ageRangeLabelY);
attachDual(groupRangeWrap,  groupMin, groupMax, fillGroup, groupRangeLabel, null, 1, 8, true);

// counts row uses status filters (+ gender/sameSex)
async function refreshOpenCounts(){
  const email = emailEl.value.trim();
  const minAge = Math.min(+ageMin.value, +ageMax.value);
  const maxAge = Math.max(+ageMin.value, +ageMax.value);
  const gender = (genderInputs.find(r=>r.checked)||{}).value || '';
  const same = !!sameSexPref.checked;
  try{
    const res = await window.API.counts({ excludeEmail: email || null, minAge, maxAge, userGender: gender, sameSex: same });
    const d = res.data || {};
    if (countCoffee) countCoffee.textContent = d.coffee ?? 0;
    if (countLunch)  countLunch.textContent  = d.lunch  ?? 0;
    if (countZanpan) countZanpan.textContent = d.zanpan ?? 0;
  }catch(_){}
}
window.addEventListener('load', refreshOpenCounts);

// Ping Now
yapBtn.onclick = async () => {
  const email=emailEl.value.trim(), name=nameEl.value.trim();
  if(!email || !name){ yapMsg.textContent='Fill Email + Name first.'; yapMsg.className='hint err'; return; }
  const minAge = Math.min(+ageMinY.value, +ageMaxY.value);
  const maxAge = Math.max(+ageMinY.value, +ageMaxY.value);
  const gender = (genderInputs.find(r=>r.checked)||{}).value || '';
  const same = !!sameSexYap.checked;
  const gmin = (category==='coffee') ? 1 : +groupMin.value;
  const gmax = (category==='coffee') ? 1 : +groupMax.value;

  try{
    yapMsg.textContent='Sending…'; yapMsg.className='hint';
    persistLocal();
    const res = await window.API.yap({ email, name, category, open: openEl.checked, minAge, maxAge, sameSex: same, userGender: gender, groupMin: gmin, groupMax: gmax });
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

