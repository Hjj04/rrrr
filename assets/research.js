const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

/* ---------- Table I with backbone toggle ---------- */
(function table1(){
  const D = {
    oft: { rows: [['Weight Insertion',0,'0/20',100,'20/20','+100','3.15'],['Tissue Extraction',0,'0/20',100,'20/20','+100','4.35'],['Balance Placement',0,'0/20',95,'19/20','+95','16.41'],['Toy Suspension',0,'0/20',70,'14/20','+70','27.30']], avg: ['0.00','91.25','+91.25','12.80'] },
    pi:  { rows: [['Weight Insertion',5,'1/20',100,'20/20','+95','10.17'],['Tissue Extraction',100,'20/20',100,'20/20','—','13.14'],['Balance Placement',65,'13/20',95,'19/20','+30','11.45'],['Toy Suspension',10,'2/20',70,'14/20','+60','6.51']], avg: ['45.00','91.25','+46.25','10.32'] }
  };
  const tb = document.getElementById('t1');
  function render(key){
    const d = D[key];
    tb.innerHTML = d.rows.map(r =>
      `<tr><td>${r[0]}</td>` +
      `<td>${r[1]}<span class="k">(${r[2]})</span></td><td class="up">${r[3]}<span class="k">(${r[4]})</span></td>` +
      `<td${r[5] !== '—' ? ' class="up"' : ''}>${r[5]}</td><td>${r[6]}</td></tr>`).join('') +
      `<tr class="avg"><td>Average</td><td>${d.avg[0]}</td><td class="up">${d.avg[1]}</td><td class="up">${d.avg[2]}</td><td>${d.avg[3]}</td></tr>`;
  }
  document.querySelectorAll('[data-bb]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-bb]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    render(b.dataset.bb);
  }));
  render('oft');
})();

/* ---------- curriculum weighting widget ---------- */
(function curriculum(){
  const svg = document.getElementById('curr'); if (!svg) return;
  const vIn = document.getElementById('c-v'), sIn = document.getElementById('c-s');
  const vOut = document.getElementById('c-v-o'), sOut = document.getElementById('c-s-o'), read = document.getElementById('c-read');
  const x0 = 160, x1 = 730, cTop = 18, cH = 112, rTop = 178, rH = 38;
  const X = l => x0 + (x1 - x0) * l;
  const tasks = ['Weight Insertion', 'Tissue Extraction', 'Balance Placement', 'Toy Suspension'];
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const skew = [0.8, 1.3, 1.0, 1.8];
  const pts = [];
  tasks.forEach((t, ti) => {
    for (let k = 0; k < 20; k++) {
      let l = k < 4 ? 0 : k < 8 ? 1 : Math.pow(rnd(), skew[ti]);
      pts.push({ ti, l, jy: (rnd() - 0.5) * 18 });
    }
  });

  // static frame
  for (const t of [0, .25, .5, .75, 1]) {
    el('line', { x1: X(t), x2: X(t), y1: cTop, y2: rTop + rH * 4 - 6, class: 'c-grid' }, svg);
    const tx = el('text', { x: X(t), y: rTop + rH * 4 + 14, 'text-anchor': 'middle', class: 'c-txt' }, svg); tx.textContent = t;
  }
  el('line', { x1: x0, x2: x1, y1: cTop + cH, y2: cTop + cH, class: 'c-axis' }, svg);
  const yl = el('text', { x: x0 - 12, y: cTop + 12, 'text-anchor': 'end', class: 'c-txt ink' }, svg); yl.textContent = 'weight ω′';
  const yl1 = el('text', { x: x0 - 12, y: cTop + cH + 4, 'text-anchor': 'end', class: 'c-txt' }, svg); yl1.textContent = '0';
  const xl = el('text', { x: x1, y: rTop + rH * 4 + 32, 'text-anchor': 'end', class: 'c-txt' }, svg); xl.innerHTML = 'normalized executed scale λ<tspan dy="4" font-size="10">norm</tspan>';
  tasks.forEach((t, ti) => { const tx = el('text', { x: x0 - 12, y: rTop + ti * rH + rH / 2 + 4, 'text-anchor': 'end', class: 'c-txt' }, svg); tx.textContent = t; });
  const lo = el('text', { x: X(0), y: rTop - 12, class: 'c-txt' }, svg); lo.textContent = 'little correction';
  const hi = el('text', { x: X(1), y: rTop - 12, 'text-anchor': 'end', class: 'c-txt' }, svg); hi.textContent = 'strong correction';

  const area = el('path', { class: 'c-area' }, svg);
  const curve = el('path', { class: 'c-curve' }, svg);
  const peak = el('line', { y1: cTop - 4, y2: rTop + rH * 4 - 6, class: 'c-peak' }, svg);
  const peakT = el('text', { y: cTop - 6, class: 'c-peak-t' }, svg);
  const dots = pts.map(p => el('circle', { class: 'c-dot', cx: X(p.l), cy: rTop + p.ti * rH + rH / 2 + p.jy }, svg));

  function render(){
    const v = vIn.value / 100, sigma = sIn.value / 100, pk = 0.12 + 0.76 * v;
    vOut.textContent = Math.round(v * 100) + '%'; sOut.textContent = sigma.toFixed(2);
    const w = l => Math.exp(-Math.pow(l - pk, 2) / (2 * sigma * sigma));
    let c = '', a = 'M' + X(0) + ' ' + (cTop + cH);
    for (let j = 0; j <= 200; j++) { const l = j / 200, y = cTop + cH - w(l) * cH; c += (j ? 'L' : 'M') + X(l).toFixed(1) + ' ' + y.toFixed(1); a += 'L' + X(l).toFixed(1) + ' ' + y.toFixed(1); }
    a += 'L' + X(1) + ' ' + (cTop + cH) + 'Z';
    curve.setAttribute('d', c); area.setAttribute('d', a);
    peak.setAttribute('x1', X(pk)); peak.setAttribute('x2', X(pk));
    peakT.setAttribute('x', X(pk) + 6); peakT.innerHTML = 'Λ<tspan dy="4" font-size="10">peak</tspan><tspan dy="-4"> = ' + pk.toFixed(2) + '</tspan>';
    const wp = pts.map(p => w(p.l)), mean = wp.reduce((s, x) => s + x, 0) / wp.length;
    let hiShare = 0, tot = 0;
    wp.forEach((x, i) => {
      const wh = x / (mean + 1e-6);
      dots[i].setAttribute('r', Math.min(10, 1.6 + 3.6 * Math.sqrt(wh)).toFixed(2));
      dots[i].setAttribute('fill-opacity', (0.25 + 0.75 * Math.min(1, x)).toFixed(2));
      tot += wh; if (pts[i].l >= 0.5) hiShare += wh;
    });
    read.innerHTML = `Share of batch weight on transitions with λ<sub>norm</sub> ≥ 0.5: <b>${Math.round(100 * hiShare / tot)}%</b>. Each task contributes 20 of the 80 samples.`;
  }
  vIn.addEventListener('input', render); sIn.addEventListener('input', render);
  render();
})();

/* ---------- lightbox ---------- */
(function lightbox(){
  const dlg = document.getElementById('lb'), img = document.getElementById('lb-img'), inner = document.getElementById('lb-inner');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
    const src = b.querySelector('img'); img.src = src.src; img.alt = src.alt; inner.classList.remove('big'); dlg.showModal();
  }));
  img.addEventListener('click', e => { e.stopPropagation(); inner.classList.toggle('big'); });
  inner.addEventListener('click', e => { if (e.target === inner) dlg.close(); });
  document.getElementById('lb-close').addEventListener('click', () => dlg.close());
})();

/* ---------- section rail ---------- */
(function rail(){
  const links = [...document.querySelectorAll('.rail a')];
  const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); const a = map.get(e.target.id); if (a) a.classList.add('on'); } });
  }, { rootMargin: '-35% 0px -60% 0px' });
  map.forEach((a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

