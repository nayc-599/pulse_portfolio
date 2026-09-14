// Project page: vertical curved roadmap timeline. The path is drawn from
// the real rendered position of each .roadmap-timeline__node rather than a
// fixed viewBox, so it stays correct regardless of how tall any row's copy
// turns out to be. Motion-policy exception, same basis as the device cube's
// scroll-linked rotation: the path draws in via stroke-dashoffset as the
// section scrolls into view, and is fully drawn immediately under
// prefers-reduced-motion.

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

    return {
      lenDone: pathDone.getTotalLength(),
      lenUpcoming: pathUpcoming.getTotalLength(),
    };
  }

  let lengths = measure();

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    pathDone.style.strokeDasharray = 'none';
    pathUpcoming.style.strokeDasharray = 'none';
  } else {
    // Progress is measured against the component's own height, not a
    // whole-viewport enter/exit span: for content several viewport heights
    // tall, the naive "top enters at the bottom, done when bottom exits at
    // the top" formula only reaches 1 once the bottom has scrolled fully
    // past the top of the viewport, i.e. once it's no longer visible, so
    // the path always looks like it stops short while any of it is still
    // on screen. Instead, t reaches 1 once the bottom of the component
    // crosses a fixed line near the top of the viewport, so the last node
    // finishes drawing while it's still comfortably in view.
    const onScroll = () => {
      const r = root.getBoundingClientRect();
      const readLine = window.innerHeight * 0.25;
      const t = Math.max(0, Math.min(1, (readLine - r.top) / r.height));
      const revealed = t * (lengths.lenDone + lengths.lenUpcoming);

      pathDone.setAttribute('stroke-dasharray', lengths.lenDone);
      pathDone.setAttribute(
        'stroke-dashoffset',
        Math.max(0, lengths.lenDone - Math.min(revealed, lengths.lenDone))
      );

      pathUpcoming.setAttribute('stroke-dasharray', lengths.lenUpcoming);
      pathUpcoming.setAttribute(
        'stroke-dashoffset',
        Math.max(0, lengths.lenUpcoming - Math.max(0, Math.min(revealed - lengths.lenDone, lengths.lenUpcoming)))
      );
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      lengths = measure();
      onScroll();
    });
    onScroll();
  }
}
