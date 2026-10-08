// Paste into the live system's page before taking a screenshot.
// __mask(): replaces real data in the DOM with demo data (display only — nothing is saved or sent).
// __rect(selector, text): highlight rectangle in % of the viewport, for a step's `highlight`.
//
// EDIT THE `exact` LIST FIRST: put the real values that appear on screen (company name, ID / company
// number, address, phone patterns) on the left and the demo values on the right.
window.__mask = () => {
  const exact = [
    [/REAL COMPANY NAME בע[`'"״]*מ/g, "ספק לדוגמה בע״מ"],
    [/123456789/g, "999999999"], // real ID / company number
    [/REAL STREET 1,?\s*REAL CITY/g, "רחוב הדוגמה 1, תל אביב"],
    [/05\d[\s-]?\d{7}/g, "050-0000000"], // any Israeli mobile number
  ];
  // Long numbers and amounts are scrambled deterministically (same input → same output); dates are kept.
  const scramble = (s) => {
    let h = 7;
    return s.replace(/\d/g, (d, i) => {
      h = (h * 31 + d.charCodeAt(0) + i) % 10;
      return String(h);
    });
  };
  const isDate = (p) => /^\d{1,2}[./]\d{1,2}[./]\d{2,4}$/.test(p);
  const maskNumbers = (t) =>
    t
      .split(/(\d{1,2}[./]\d{1,2}[./]\d{2,4})/)
      .map((part) =>
        isDate(part)
          ? part
          : part.replace(/\d{6,}/g, scramble).replace(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+\.\d+/g, scramble),
      )
      .join("");
  const fix = (t) => {
    let out = t;
    for (const [re, v] of exact) out = out.replace(re, v);
    return maskNumbers(out);
  };
  let count = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const v = fix(n.nodeValue);
    if (v !== n.nodeValue) {
      n.nodeValue = v;
      count++;
    }
  }
  document.querySelectorAll("input, textarea").forEach((el) => {
    const v = el.value && fix(el.value);
    if (v && v !== el.value) {
      el.value = v;
      count++;
    }
  });
  return count; // number of replaced texts — check the page visually afterwards
};

// Viewport-percent rect (with a 6px margin) of the first visible element matching `sel`
// and, optionally, containing `text`. Example: __rect('button', 'החלף רשות')
window.__rect = (sel, text) => {
  const els = [...document.querySelectorAll(sel)].filter((e) => !text || e.textContent.includes(text));
  const e = els.find((x) => x.getBoundingClientRect().width > 0);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  const W = innerWidth, H = innerHeight, p = (v, d) => Math.round((v / d) * 1000) / 10;
  return { x: p(r.left - 6, W), y: p(r.top - 6, H), w: p(r.width + 12, W), h: p(r.height + 12, H) };
};
"ready";
