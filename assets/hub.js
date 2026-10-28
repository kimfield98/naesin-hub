/* 에이닷 내신 분석실 · 동작 (내용은 content.js) */
(function(){
  const H = window.HUB, V = H.version;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  /* 안내 문구 표기: [버튼] `파일` **강조** */
  const fmt = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>')
    .replace(/`([^`]+)`/g, '<code class="file">$1</code>')
    .replace(/\[([^\[\]]+)\]/g, '<span class="btn">$1</span>');
  const TABS = ['guide','simhwa','trend','prompt','qna'];
  const TOOL_NAME = {simhwa:'심화분석지', trend:'경향분석지'};

  /* ── 이 브라우저에만 남는 진행 체크 ── */
  const SKEY = 'adot-hub-v1';
  let S = {role:'teacher', done:{teacher:[]}};
  try{ const s = JSON.parse(localStorage.getItem(SKEY)||'null'); if(s && s.done) S = Object.assign(S, s); }catch(e){}
  if(!H.roles[S.role]) S.role = Object.keys(H.roles)[0];   // v3.9: 역할이 하나(강사)뿐
  if(S.v !== 2){ S.done = {}; S.v = 2; }                     // 단계가 바뀌어 예전 체크는 지움
  const keep = () => { try{ localStorage.setItem(SKEY, JSON.stringify(S)); }catch(e){} };

  /* ── 알림 ── */
  let tt; function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(()=>t.classList.remove('on'), 2200); }

  /* ── 복사 ── */
  function copy(text, btn, label){
    const done = () => { toast('복사했습니다. AI 채팅에 붙여 넣으세요.'); if(btn){ const o = btn.textContent; btn.textContent = label||'복사됨'; btn.classList.add('done'); setTimeout(()=>{ btn.textContent = o; btn.classList.remove('done'); }, 1600); } };
    const fallback = () => { const ta = document.createElement('textarea'); ta.value = text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
      let ok = false; try{ ok = document.execCommand('copy'); }catch(e){} ta.remove(); ok ? done() : toast('복사하지 못했습니다. 글을 직접 드래그해 복사하세요.'); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  /* ── 버전 표시 ── */
  $('#verPill').textContent = `${V.label} · ${V.date}`;
  $$('[data-ver]').forEach(el => el.textContent = 'v' + V[el.dataset.ver].ver);
  const toolUrl = k => `${V[k].file}?v=${encodeURIComponent(V[k].ver)}`;
  $$('[data-open]').forEach(a => a.href = toolUrl(a.dataset.open));
  $$('[data-dl]').forEach(a => { const k = a.dataset.dl; a.href = V[k].file; a.download = `${k==='simhwa'?'내신심화분석지':'내신경향분석지'}_템플릿_v${V[k].ver}.html`; });
  $('#dlPrompt').href = V.prompt.file; $('#dlPrompt').download = V.prompt.file.split('/').pop();

  /* ── 안내: 단계 ── */
  const role = () => H.roles[S.role];
  const isDone = (r,i) => (S.done[r]||[]).includes(i);
  function toggleDone(r, i, on){
    const a = S.done[r] = (S.done[r]||[]).filter(x=>x!==i); if(on) a.push(i); keep(); renderGuide(); renderDrawer();
  }
  function stepHTML(r, st, i){
    const d = isDone(r,i);
    return `<article class="step${d?' is-done':''}" id="step-${r}-${i}" data-i="${i}">
      <div class="step-h"><span class="no">${i+1}</span><h3>${fmt(st.title)}</h3>
        <label class="chk"><input type="checkbox" data-r="${r}" data-i="${i}" ${d?'checked':''}> 했어요</label></div>
      <ul>${st.body.map(b=>`<li>${fmt(b)}</li>`).join('')}</ul>
      ${st.go?`<div class="step-f"><a class="go" href="#${st.go}">${esc(st.goLabel||'열기')}</a></div>`:''}
      ${st.stuck && st.stuck.length?`<details class="stuck"><summary>막히면</summary><dl>${st.stuck.map(([q,a])=>`<dt>${fmt(q)}</dt><dd>${fmt(a)}</dd>`).join('')}</dl></details>`:''}
    </article>`;
  }
  function renderGuide(){
    const r = S.role, R = role(), n = R.steps.length, d = R.steps.filter((_,i)=>isDone(r,i)).length;
    $$('.seg [data-role]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.role===r)));
    $('#roleLead').textContent = R.lead;
    $('#progBar').style.width = (n ? d/n*100 : 0) + '%';
    $('#progText').textContent = `${d} / ${n} 단계 완료`;
    $('#progReset').hidden = !d;
    $('#toc').innerHTML = R.steps.map((st,i)=>`<li><a href="#guide" data-step="${i}" class="${isDone(r,i)?'done':''}"><span class="n">${String(i+1).padStart(2,'0')}</span><span>${esc(st.title.replace(/[`*\[\]]/g,''))}</span></a></li>`).join('');
    $('#steps').innerHTML = R.steps.map((st,i)=>stepHTML(r,st,i)).join('');
    watchSteps();
  }
  $$('.seg [data-role]').forEach(b => b.onclick = () => { S.role = b.dataset.role; keep(); renderGuide(); renderDrawer(); });
  $('#progReset').onclick = () => { S.done[S.role] = []; keep(); renderGuide(); renderDrawer(); };
  document.addEventListener('change', ev => { const c = ev.target; if(c.matches('input[type=checkbox][data-r]')) toggleDone(c.dataset.r, +c.dataset.i, c.checked); });
  $('#toc').addEventListener('click', ev => { const a = ev.target.closest('a[data-step]'); if(!a) return; ev.preventDefault();
    const el = $(`#step-${S.role}-${a.dataset.step}`); if(el) el.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'}); });

  let io; function watchSteps(){
    if(io) io.disconnect(); if(!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(es => { es.forEach(e => { if(e.isIntersecting){ const i = e.target.dataset.i;
      $$('#toc a').forEach(a => a.classList.toggle('cur', a.dataset.step===i)); } }); }, {rootMargin:'-30% 0px -60% 0px'});
    $$('.step').forEach(s => io.observe(s));
  }

  /* 기준표 */
  $('#critList').innerHTML = H.criteria.map((c,i)=>`<details class="crit"${i===0?' open':''}><summary>${esc(c.title)}</summary><div class="cb">
      ${c.table?`<dl class="kv">${c.table.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${fmt(v)}</dd>`).join('')}</dl>`:''}
      ${(c.body||[]).map(p=>`<p>${fmt(p)}</p>`).join('')}</div></details>`).join('');

  /* ── 프롬프트 ── */
  $('#promptText').textContent = H.prompt;
  $('#copyPrompt').onclick = ev => copy(H.prompt, ev.currentTarget, '복사됨 ✓');
  $('#fixes').innerHTML = H.fixes.map(([l,p],i)=>`<li><span class="fl">✕ ${esc(l)}</span><span class="fp">${esc(p)}</span><button type="button" class="tbtn" data-fix="${i}">복사</button></li>`).join('');
  $('#fixes').addEventListener('click', ev => { const b = ev.target.closest('[data-fix]'); if(b) copy(H.fixes[+b.dataset.fix][1], b); });

  /* ── Q&A: content.js의 qna를 최신순으로, 분류·검색으로 거르기 ── */
  const QA = (H.qna||[]).slice().sort((a,b)=> String(b.date).localeCompare(String(a.date)));
  let qaCat = '전체';
  function renderQna(){
    const cats = ['전체', ...new Set(QA.map(q=>q.cat))];
    $('#qnaLead').textContent = `질문 ${QA.length}개 · 새 질문은 실습 시간이나 카톡으로 남겨 주세요. 답이 정리되면 여기에 쌓입니다.`;
    $('#qnaChips').innerHTML = cats.map(c=>`<button type="button" class="qchip" data-qc="${esc(c)}" aria-pressed="${c===qaCat}">${esc(c)}</button>`).join('');
    const kw = ($('#qnaSearch').value||'').trim().toLowerCase();
    const list = QA.filter(q => (qaCat==='전체'||q.cat===qaCat) && (!kw || [q.q,q.a,q.cat,q.who].join(' ').toLowerCase().includes(kw)));
    $('#qnaList').innerHTML = list.length ? list.map(q=>`<details class="qa" ${list.length<=4?'open':''}>
        <summary><span class="qcat">${esc(q.cat)}</span><span class="qq">${fmt(q.q)}</span><span class="qmeta">${esc(q.who||'')} · ${esc(q.date)}</span></summary>
        <div class="qa-a">${(Array.isArray(q.a)?q.a:[q.a]).map(x=>`<p>${fmt(x)}</p>`).join('')}${q.ver?`<p class="qver">반영: ${esc(q.ver)}</p>`:''}</div></details>`).join('')
      : '<p class="note">찾는 질문이 없습니다.</p>';
  }
  $('#qnaChips').addEventListener('click', ev => { const b = ev.target.closest('[data-qc]'); if(!b) return; qaCat = b.dataset.qc; renderQna(); });
  $('#qnaSearch').addEventListener('input', renderQna);
  renderQna();

  /* ── 템플릿 띄우기: 처음 열 때만 불러오고, 탭을 옮겨도 작업 중인 화면은 그대로 둠 ── */
  function loadFrame(k){ const f = $(`[data-frame="${k}"]`); if(f && !f.getAttribute('src')) f.src = toolUrl(k); return f; }

  /* ── 단계 안내 서랍 (분석지 탭에서 작업하며 보기) ── */
  let drawerFor = null;
  function renderDrawer(){
    if(!drawerFor) return;
    const r = S.role, R = role();
    $('#drTitle').textContent = `${TOOL_NAME[drawerFor]} 단계`;
    const list = R.steps.map((st,i)=>({st,i})).filter(o=>o.st.go===drawerFor);
    $('#drBody').innerHTML = list.length ? list.map(({st,i})=>{ const d = isDone(r,i); return `<div class="dstep${d?' is-done':''}">
        <div class="dh"><span class="n">${String(i+1).padStart(2,'0')}</span><b>${fmt(st.title)}</b><label class="chk"><input type="checkbox" data-r="${r}" data-i="${i}" ${d?'checked':''}> 했어요</label></div>
        <ul>${st.body.map(b=>`<li>${fmt(b)}</li>`).join('')}</ul></div>`; }).join('') + `<p class="dempty">자세한 설명과 '막히면'은 <a href="#guide">안내</a> 탭에 있습니다.</p>`
      : `<p class="dempty">이 화면에서 할 단계가 없습니다.</p>`;
  }
  function openDrawer(k){ drawerFor = k; $('#drawer').hidden = false; document.body.classList.add('dr-open'); renderDrawer(); }
  function closeDrawer(){ drawerFor = null; $('#drawer').hidden = true; document.body.classList.remove('dr-open'); }
  $$('[data-drawer]').forEach(b => b.onclick = () => drawerFor===b.dataset.drawer ? closeDrawer() : openDrawer(b.dataset.drawer));
  $('#drClose').onclick = closeDrawer;
  document.addEventListener('keydown', ev => { if(ev.key==='Escape' && drawerFor) closeDrawer(); });

  /* ── 탭 이동 (주소 #guide #simhwa #trend #prompt) ── */
  let cur = null;
  function show(){
    let t = (location.hash||'').replace('#',''); if(!TABS.includes(t)) t = 'guide';
    if(t!==cur){
      TABS.forEach(k => $(`#view-${k}`).hidden = k!==t);
      $$('.tabs a').forEach(a => { if(a.dataset.tab===t) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
      if(TOOL_NAME[t]) loadFrame(t); else closeDrawer();
      if(drawerFor && drawerFor!==t) openDrawer(t);
      document.title = (t==='guide' ? '' : ({simhwa:'심화분석지',trend:'경향분석지',prompt:'프롬프트',qna:'Q&A'})[t] + ' · ') + '에이닷 내신 분석실';
      cur = t; window.scrollTo(0,0);
    }
  }
  window.addEventListener('hashchange', show);

  /* 분석지 탭에서 Ctrl/Cmd+P를 누르면 바깥 페이지 대신 템플릿을 인쇄 */
  document.addEventListener('keydown', ev => {
    if(!(ev.key==='p' || ev.key==='P') || !(ev.ctrlKey||ev.metaKey) || !TOOL_NAME[cur]) return;
    ev.preventDefault();
    try{ const w = loadFrame(cur).contentWindow; w.focus(); w.print(); }
    catch(e){ toast('템플릿 위쪽의 [인쇄] 버튼을 눌러 주세요.'); }
  });

  /* 상단 메뉴 높이 → 작업 공간 높이 */
  const setH = () => document.documentElement.style.setProperty('--hdr', $('#hdr').offsetHeight + 'px');
  window.addEventListener('resize', setH); setH();

  renderGuide();
  show();
})();
