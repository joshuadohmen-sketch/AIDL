// ── AIDL Piktogramme (CC-style SVG icons)
// Each icon is a simple, bold, monochrome path inside a 24×24 viewBox.

const ICONS = {
  // ── Extent of AI Use
  N: `<path d="M12 4a4 4 0 100 8 4 4 0 000-8zm0 10c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" fill="currentColor"/>`,
  A: `<path d="M10 4a3.5 3.5 0 100 7 3.5 3.5 0 000-7zm0 9c-3.9 0-7 1.9-7 4.5V19h14v-1.5C17 14.9 13.9 13 10 13z" fill="currentColor"/><path d="M19 3l1.5 3L24 7.5 20.5 9 19 12l-1.5-3L14 7.5 17.5 6z" fill="currentColor"/>`,
  S: `<path d="M9 4a3 3 0 100 6 3 3 0 000-6zm0 8c-3.3 0-6 1.6-6 3.8V17h12v-1.2C15 13.6 12.3 12 9 12z" fill="currentColor"/><rect x="16" y="8" width="6" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="11" r=".8" fill="currentColor"/><circle cx="20.5" cy="11" r=".8" fill="currentColor"/><line x1="17.5" y1="13.8" x2="21" y2="13.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>`,
  G: `<rect x="5" y="4" width="14" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="9.5" cy="11" r="1.5" fill="currentColor"/><circle cx="14.5" cy="11" r="1.5" fill="currentColor"/><path d="M9 15.5h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 1v3M8 2.5l.5 2M16 2.5l-.5 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,

  // ── Hosting
  'H:L': `<rect x="4" y="5" width="16" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 19h6M12 16v3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  'H:I': `<path d="M12 2L3 8v1h18V8L12 2z" fill="currentColor"/><rect x="5" y="10" width="3" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="10.5" y="10" width="3" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="16" y="10" width="3" height="8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2 19h20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  'H:C': `<path d="M6.5 18A5 5 0 016.1 8.5a6.5 6.5 0 0112.4-1.3A4 4 0 0118.5 18H6.5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9 13.5l2.5 2.5L16 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  'H:C!': `<path d="M6.5 18A5 5 0 016.1 8.5a6.5 6.5 0 0112.4-1.3A4 4 0 0118.5 18H6.5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 10v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.1" fill="currentColor"/>`,

  // ── Review
  'R:H': `<path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="currentColor"/>`,
  'R:M': `<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 5v2.5M12 16.5V19M5 12h2.5M16.5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  'R:HM': `<path d="M10 5C5 5 2 10 2 10s3 5 8 5c2 0 3.5-.7 5-2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="10" r="2" fill="currentColor"/><circle cx="18" cy="14" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="14" r="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M18 9.5v1.5M18 17v1.5M13.5 14h1.5M21 14h1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  'R:N': `<path d="M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>`,

  // ── Accountability
  'Acc:I': `<circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 22c0-4.4 3.1-7 7-7s7 2.6 7 7" fill="none" stroke="currentColor" stroke-width="2"/>`,
  'Acc:O': `<circle cx="12" cy="6" r="3" fill="currentColor"/><circle cx="5" cy="10" r="2.5" fill="currentColor"/><circle cx="19" cy="10" r="2.5" fill="currentColor"/><path d="M8 22c0-2.8 1.8-5 4-5s4 2.2 4 5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M1 22c0-2.5 1.8-4.2 4-4.2 1 0 1.8.3 2.3.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M23 22c0-2.5-1.8-4.2-4-4.2-1 0-1.8.3-2.3.8" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  'Acc:N': `<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9a3 3 0 014.7 2.5c0 1.5-2.2 2-2.2 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.2" fill="currentColor"/>`,
};

// Render an icon SVG element
function iconSVG(key, size = 24) {
  if (!ICONS[key]) return '';
  return `<svg class="aidl-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[key]}</svg>`;
}

// ── Badge rendering
// Generates an inline SVG badge (CC-style) for the current selection
function buildBadgeSVG(state, labelText) {
  const dims = [];

  if (state.stamm) dims.push({ key: state.stamm, code: state.stamm });
  if (state.stamm !== 'N') {
    if (state.host) dims.push({ key: state.host, code: state.host });
    if (state.review) dims.push({ key: state.review, code: state.review });
  }
  if (state.acc) dims.push({ key: state.acc, code: state.acc });

  if (dims.length === 0) return '';

  const r = 22;
  const gap = 56;
  const padX = 20;
  const padY = 14;
  const totalW = padX * 2 + (dims.length - 1) * gap + r * 2;
  const h = r * 2 + padY + 26;

  let circles = '';
  dims.forEach((d, i) => {
    const cx = padX + r + i * gap;
    const cy = padY + r;
    const isWarn = d.code === 'H:C!' || d.code === 'R:N' || d.code === 'Acc:N';
    const fill = isWarn ? '#c61a27' : '#000000';
    const iconPaths = (ICONS[d.key] || '').replace(/currentColor/g, '#ffffff');
    circles += `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>
      <g transform="translate(${cx - 12},${cy - 12})">${iconPaths}</g>
      <text x="${cx}" y="${cy + r + 14}" text-anchor="middle"
            font-family="'Courier New',monospace" font-size="10" font-weight="700"
            fill="#666">${d.code}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${h}" width="${totalW}" class="aidl-badge">
    ${circles}
  </svg>`;
}

// Download badge as SVG file
function downloadBadge() {
  const el = document.getElementById('badge-container');
  if (!el || !el.innerHTML.trim()) return;
  const svg = el.querySelector('svg');
  if (!svg) return;
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aidl-badge.svg';
  a.click();
  URL.revokeObjectURL(url);
}
