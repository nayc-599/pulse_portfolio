// Journal index: two tabs, Build log and Weekly updates (real tab
// semantics: arrow keys, Home and End move between them). Build log is the
// default. The choice is kept in the URL (#build-log, #weekly-updates) so
// either tab can be linked; old #updates links open Weekly updates.

const tabs = [...document.querySelectorAll('.journal-tabs [role="tab"]')];
const panels = [...document.querySelectorAll('.journal-panel[role="tabpanel"]')];
const FROM_HASH = { '#build-log': 'build-log', '#weekly-updates': 'weekly-updates', '#updates': 'weekly-updates' };

function select(name, { focus = false, updateHash = false } = {}) {
  if (!tabs.some((t) => t.dataset.tab === name)) name = 'build-log';
  tabs.forEach((t) => {
    const on = t.dataset.tab === name;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  panels.forEach((p) => { p.hidden = p.dataset.panel !== name; });
  if (updateHash) history.replaceState(null, '', '#' + name);
}

tabs.forEach((t, i) => {
  t.addEventListener('click', () => select(t.dataset.tab, { updateHash: true }));
  t.addEventListener('keydown', (e) => {
    let j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = tabs.length - 1;
    if (j === null) return;
    e.preventDefault();
    select(tabs[j].dataset.tab, { focus: true, updateHash: true });
  });
});
window.addEventListener('hashchange', () => select(FROM_HASH[location.hash] || 'build-log'));
select(FROM_HASH[location.hash] || 'build-log');
if (location.hash === '#updates') history.replaceState(null, '', '#weekly-updates');
