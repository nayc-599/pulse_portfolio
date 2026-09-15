// Project page: vertical curved roadmap timeline. The path is drawn from
// the real rendered position of each .roadmap-timeline__node rather than a
// fixed viewBox, so it stays correct regardless of how tall any row's copy
// turns out to be, and it re-measures on resize. The path is static: both
// runs render in full, purple up to the current week and muted after it.

const root = document.querySelector('[data-roadmap-timeline]');

if (root) {
  const svg = root.querySelector('[data-roadmap-svg]');
  const pathDone = root.querySelector('[data-path-done]');
  const pathUpcoming = root.querySelector('[data-path-upcoming]');
  const nodes = Array.from(root.querySelectorAll('[data-node]'));
  const rows = Array.from(root.querySelectorAll('.roadmap-timeline__row'));
  const currentIndex = Math.max(0, rows.findIndex((r) => r.dataset.status === 'current'));

  function smoothPath(points) {
    if (points.length < 2) return '';
    let d = 'M ' + points[0].x + ' ' + points[0].y;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midY = (p0.y + p1.y) / 2;
      d += ' C ' + p0.x + ' ' + midY + ', ' + p1.x + ' ' + midY + ', ' + p1.x + ' ' + p1.y;
    }
    return d;
  }

  function measure() {
    const rootRect = root.getBoundingClientRect();
    const points = nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - rootRect.left,
        y: r.top + r.height / 2 - rootRect.top,
      };
    });

    svg.setAttribute('width', rootRect.width);
    svg.setAttribute('height', rootRect.height);
    svg.setAttribute('viewBox', '0 0 ' + rootRect.width + ' ' + rootRect.height);

    pathDone.setAttribute('d', smoothPath(points.slice(0, currentIndex + 1)));
    pathUpcoming.setAttribute('d', smoothPath(points.slice(currentIndex)));
  }

  measure();
  window.addEventListener('resize', measure);
}
