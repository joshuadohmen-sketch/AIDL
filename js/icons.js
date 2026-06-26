// ── AI-DTL Piktogramme (CC-style SVG icons)
// Each icon is a simple, bold, monochrome path inside a 24×24 viewBox.

const ICONS = {
  // ── Extent of AI Use
  // N: human only – person
  N: `<circle cx="12" cy="7.2" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.8 20.2c.5-4 3.4-6.4 7.2-6.4s6.7 2.4 7.2 6.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  // A: text being polished – text lines + small spark
  A: `<path d="M4 6.5h9M4 11.5h16M4 16.5h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.7 1.8L19.6 4.2 22 5.1 19.6 6 18.7 8.4 17.8 6 15.4 5.1 17.8 4.2 Z" fill="currentColor"/>`,
  // S: ideas & structure – lightbulb + spark (spark same size as A's)
  S: `<path d="M10.5 4.5a5 5 0 00-3.3 8.7c.7.65 1.2 1.4 1.2 2.3h4.2c0-.9.5-1.65 1.2-2.3A5 5 0 0010.5 4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.6 18h3.8M9.4 20.2h2.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M19 1.5L19.9 3.9 22.3 4.8 19.9 5.7 19 8.1 18.1 5.7 15.7 4.8 18.1 3.9Z" fill="currentColor"/>`,
  // G: generative AI – sparkles
  G: `<path d="M9.5 2.5L11.4 7.6 16.5 9.5 11.4 11.4 9.5 16.5 7.6 11.4 2.5 9.5 7.6 7.6 Z" fill="currentColor"/><path d="M18.3 13.5L19.4 16.4 22.3 17.5 19.4 18.6 18.3 21.5 17.2 18.6 14.3 17.5 17.2 16.4 Z" fill="currentColor"/>`,

  // ── Hosting
  'H:L': `<rect x="3.2" y="4.8" width="17.6" height="11.4" rx="1.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.3 19.8h5.4M12 16.2v3.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  'H:I': `<path d="M3.5 8.6L12 3.4l8.5 5.2v.9h-17z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M5.6 12v5.2M9.9 12v5.2M14.1 12v5.2M18.4 12v5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3.5 20.4h17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  'H:C': `<path d="M2.8 13.4A3.8 3.8 0 0 1 7.4 9.7A5.2 5.2 0 0 1 17.75 9.7A3.8 3.8 0 0 1 17 17.2H6.6A3.8 3.8 0 0 1 2.8 13.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9.2 12.4l2 2 3.6-3.6" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
  'H:C!': `<path d="M2.8 13.4A3.8 3.8 0 0 1 7.4 9.7A5.2 5.2 0 0 1 17.75 9.7A3.8 3.8 0 0 1 17 17.2H6.6A3.8 3.8 0 0 1 2.8 13.4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M11.8 8.6v3.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="11.8" cy="14.6" r="1.05" fill="currentColor"/>`,

  // ── Review – one eye family: pupil shape encodes the reviewer
  'R:H': `<path d="M2.6 12S6.1 5.9 12 5.9 21.4 12 21.4 12 17.9 18.1 12 18.1 2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/>`,
  'R:M': `<path d="M2.6 12S6.1 5.9 12 5.9 21.4 12 21.4 12 17.9 18.1 12 18.1 2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><rect x="9.9" y="9.9" width="4.2" height="4.2" rx="0.6" fill="currentColor"/><path d="M11.3 9.9V9.1M12.7 9.9V9.1M11.3 14.1v.8M12.7 14.1v.8M9.9 11.3H9.1M9.9 12.7H9.1M14.1 11.3h.8M14.1 12.7h.8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>`,
  'R:HM': `<path d="M2.6 12S6.1 5.9 12 5.9 21.4 12 21.4 12 17.9 18.1 12 18.1 2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="9" cy="12" r="1.9" fill="currentColor"/><rect x="13" y="10.1" width="3.8" height="3.8" rx="0.5" fill="currentColor"/><path d="M14.3 10.1V9.5M15.7 10.1V9.5M14.3 13.9v.6M15.7 13.9v.6M13 11.4h-.6M13 12.6h-.6M16.8 11.4h.6M16.8 12.6h.6" stroke="currentColor" stroke-width="0.95" stroke-linecap="round"/>`,
  'R:N': `<path d="M2.6 12S6.1 5.9 12 5.9 21.4 12 21.4 12 17.9 18.1 12 18.1 2.6 12 2.6 12z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/><path d="M4.2 19.8L19.8 4.2" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>`,

  // ── Accountability – who signs for it?
  'Acc:I': `<path d="M14.2 4.8l5 5L9 20l-5.5 1.2L4.7 15.7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12.4 6.6l5 5" stroke="currentColor" stroke-width="1.5"/><path d="M14.5 21.2h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  'Acc:O': `<circle cx="12" cy="6.8" r="2.7" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="5.2" cy="9.4" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="18.8" cy="9.4" r="2.1" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7.6 20.4c.4-3.1 2.1-5 4.4-5s4 1.9 4.4 5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M1.6 17.9c.3-2.4 1.7-3.9 3.6-3.9.7 0 1.4.2 2 .6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M22.4 17.9c-.3-2.4-1.7-3.9-3.6-3.9-.7 0-1.4.2-2 .6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  'Acc:N': `<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.4 9.4a2.6 2.6 0 114.2 2c-.9.7-1.6 1.3-1.6 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17.5" r="1.05" fill="currentColor"/>`,
};

// Render an icon SVG element
function iconSVG(key, size = 24) {
  if (!ICONS[key]) return '';
  return `<svg class="dtl-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[key]}</svg>`;
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

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${h}" width="${totalW}" class="dtl-badge">
    ${circles}
  </svg>`;
}

// Download badge as SVG file
function downloadBadge() {
  const svg = document.querySelector('#badge-container svg');
  if (!svg) return;
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'dtl-badge.svg'; a.click();
  URL.revokeObjectURL(url);
}

// Download badge as PNG (3× scale via canvas)
function downloadBadgePNG() {
  const svg = document.querySelector('#badge-container svg');
  if (!svg) return;
  const vb = svg.viewBox.baseVal;
  const w = vb.width, h = vb.height, scale = 3;
  let src = new XMLSerializer().serializeToString(svg);
  src = src.replace(/\bwidth="[^"]*"/, `width="${w}" height="${h}"`);
  const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w * scale; canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(pngBlob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(pngBlob);
      a.download = 'dtl-badge.png'; a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
    URL.revokeObjectURL(svgUrl);
  };
  img.src = svgUrl;
}
