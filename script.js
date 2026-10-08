// ─── Año
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── Menú en celular
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
}));

// ─── Aparición al hacer scroll
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ─── Sección activa en el menú
const links = [...document.querySelectorAll('#menu a')];
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => secObs.observe(s));

// ─── Texto que se escribe solo (caja de diálogo)
const typed = document.getElementById('typed');
if (typed && !reduceMotion) {
  const full = typed.dataset.text;
  typed.textContent = '';
  let i = 0;
  const tick = () => {
    typed.textContent = full.slice(0, ++i);
    if (i < full.length) setTimeout(tick, 32);
  };
  setTimeout(tick, 500);
}

// ─── CONTINUE? cuenta regresiva
const cd = document.getElementById('countdown');
const contTitle = document.querySelector('.continue-title');
let cdTimer = null;
new IntersectionObserver(([e]) => {
  if (e.isIntersecting && !cdTimer) {
    contTitle.classList.add('on');
    if (reduceMotion) return;
    let n = 9;
    cd.textContent = n;
    cdTimer = setInterval(() => {
      n = n > 0 ? n - 1 : 9;
      cd.textContent = n;
    }, 1000);
  } else if (!e.isIntersecting && cdTimer) {
    clearInterval(cdTimer); cdTimer = null;
  }
}, { threshold: 0.4 }).observe(document.getElementById('contact'));

// ─── Partículas pixel (brasas + estela del mouse)
(() => {
  const canvas = document.getElementById('pixels');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  const COLORS = ['#e85d04', '#ff8a3d', '#9c3d02', '#ffb26b'];
  const P = 2; // grilla de pixel
  let w, h, dpr;
  const embers = [];
  const trail = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = Math.floor(innerWidth * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    ctx.imageSmoothingEnabled = false;
  }
  resize();
  addEventListener('resize', resize);

  const count = innerWidth < 700 ? 26 : 55;
  const rnd = (a, b) => a + Math.random() * (b - a);
  function newEmber(randomY) {
    return {
      x: rnd(0, w),
      y: randomY ? rnd(0, h) : h + 10,
      s: (Math.random() < 0.7 ? 2 : Math.random() < 0.8 ? 3 : 4) * P * dpr,
      vy: rnd(0.15, 0.6) * dpr,
      sway: rnd(0, Math.PI * 2),
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
      a: rnd(0.25, 0.75),
    };
  }
  for (let i = 0; i < count; i++) embers.push(newEmber(true));

  let last = 0;
  addEventListener('pointermove', e => {
    const now = performance.now();
    if (now - last < 24) return;
    last = now;
    for (let i = 0; i < 2; i++) {
      trail.push({
        x: e.clientX * dpr + rnd(-6, 6) * dpr,
        y: e.clientY * dpr + rnd(-6, 6) * dpr,
        vx: rnd(-0.6, 0.6) * dpr,
        vy: rnd(-1.2, -0.2) * dpr,
        s: (Math.random() < 0.6 ? 3 : 4) * P * dpr,
        c: COLORS[Math.floor(Math.random() * 3)],
        life: 1,
      });
    }
    if (trail.length > 120) trail.splice(0, trail.length - 120);
  }, { passive: true });

  const snap = v => Math.round(v / (P * dpr)) * P * dpr;

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of embers) {
      p.y -= p.vy;
      p.x += Math.sin(t / 1400 + p.sway) * 0.25 * dpr;
      if (p.y < -10) Object.assign(p, newEmber(false));
      const flicker = Math.sin(t / 300 + p.sway * 7) > 0.85 ? 0.35 : 1;
      ctx.globalAlpha = p.a * flicker;
      ctx.fillStyle = p.c;
      ctx.fillRect(snap(p.x), snap(p.y), p.s, p.s);
    }
    for (let i = trail.length - 1; i >= 0; i--) {
      const p = trail[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.06 * dpr;
      p.life -= 0.025;
      if (p.life <= 0) { trail.splice(i, 1); continue; }
      ctx.globalAlpha = Math.ceil(p.life * 4) / 4; // se apaga en escalones
      ctx.fillStyle = p.c;
      ctx.fillRect(snap(p.x), snap(p.y), p.s, p.s);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
