// Project page: pipeline accordion + threshold slider demo.
// The samples themselves live as data attributes on the static markup
// (project.html) so there is one copy of the demo dataset, not two.

const slider = document.querySelector('#thr');
const bars = document.querySelectorAll('.threshold-bar');

if (slider && bars.length) {
  const samples = Array.from(bars).map((el) => ({
    fill: el.querySelector('.threshold-bar__fill'),
    v: Number(el.dataset.v),
    pain: el.dataset.pain === '1',
  }));
  const totalPain = samples.filter((s) => s.pain).length;

  const labelEl = document.querySelector('[data-threshold-label]');
  const firedEl = document.querySelector('[data-fired]');
  const missedEl = document.querySelector('[data-missed]');
  const falsesEl = document.querySelector('[data-falses]');
  const verdictEl = document.querySelector('[data-verdict]');

  function render() {
    const thr = Number(slider.value);
    let fired = 0, missed = 0, falses = 0;
    samples.forEach((s) => {
      const fires = s.v >= thr;
      if (fires) fired++;
      if (s.pain && !fires) missed++;
      if (!s.pain && fires) falses++;
      s.fill.style.height = Math.round(s.v * 100) + '%';
      s.fill.style.background = fires ? 'var(--amber)' : 'rgba(var(--amber-dim-rgb),0.3)';
      s.fill.style.borderTop = '2px solid ' + (s.pain ? (fires ? 'var(--amber)' : 'var(--amber-dim)') : 'transparent');
    });

    if (labelEl) labelEl.textContent = 'THRESHOLD ' + thr.toFixed(2);
    if (firedEl) firedEl.textContent = String(fired);
    if (missedEl) missedEl.textContent = String(missed);
    if (falsesEl) falsesEl.textContent = String(falses);
    if (verdictEl) {
      let verdict;
      if (thr <= 0.3) {
        verdict = 'Almost everything fires. The carer is woken for sneezes, yawns and shifting in bed — and by week two they have muted the app.';
      } else if (missed === 0) {
        verdict = 'Every labelled pain event is caught, but ' + falses + ' quiet moments are treated as emergencies. Trust is the cost.';
      } else if (falses === 0) {
        verdict = 'No false alarms — and ' + missed + ' of ' + totalPain + ' real pain events pass in silence. That silence is the cost.';
      } else {
        verdict = falses + ' false alarms and ' + missed + ' missed pain events. There is no setting that gives you zero of both; 0.65 is where we currently think the trade is least bad.';
      }
      verdictEl.textContent = verdict;
    }
  }

  slider.addEventListener('input', render);
  render();
}

document.querySelectorAll('.pipeline-toggle').forEach((btn) => {
  const panel = document.getElementById(btn.getAttribute('aria-controls'));
  const sign = btn.querySelector('.pipeline-toggle__sign');
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (panel) panel.hidden = open;
    if (sign) sign.textContent = open ? '+' : '−';
  });
});
