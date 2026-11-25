const embed = (id, start) => {
  const f = document.createElement('iframe');
  f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1${start ? `&start=${start}` : ''}`;
  f.title = 'Reproductor de YouTube';
  f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  f.allowFullscreen = true;
  return f;
};

// Vídeo de presentación del hero: se carga solo al pulsar (la web arranca ligera)
const hero = document.querySelector('.hero__video');
hero.querySelector('.play').addEventListener('click', () => hero.replaceChildren(embed(hero.dataset.yt)));

// Portfolio: abre cada vídeo en un modal
const player = document.getElementById('player');
const frame = player.querySelector('.player__frame');
document.querySelectorAll('.work__item').forEach((btn) =>
  btn.addEventListener('click', () => {
    frame.replaceChildren(embed(btn.dataset.yt, btn.dataset.start));
    player.showModal();
  })
);
player.querySelector('.player__close').addEventListener('click', () => player.close());
player.addEventListener('click', (e) => e.target === player && player.close());
player.addEventListener('close', () => frame.replaceChildren()); // corta el audio al cerrar

// Carrusel de clientes: duplica la lista para que el bucle no tenga corte
const track = document.querySelector('.marquee__track');
track.append(...[...track.children].map((li) => {
  const c = li.cloneNode(true);
  c.setAttribute('aria-hidden', 'true');
  c.querySelectorAll('a').forEach((a) => (a.tabIndex = -1));
  return c;
}));

// Badge "Open to work" con efecto máquina de escribir
const typed = document.querySelector('[data-type]');
const text = typed.dataset.type;
let i = 0;
typed.textContent = '';
const tick = () => { typed.textContent = text.slice(0, ++i); if (i < text.length) setTimeout(tick, 90); };
setTimeout(tick, 500);

// Aparición al hacer scroll + contador de estadísticas
const countUp = (el) => {
  const to = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = performance.now();
  const step = (t) => {
    const p = Math.min((t - t0) / 1400, 1);
    el.textContent = Math.round(to * (1 - (1 - p) ** 3)) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
const io = new IntersectionObserver((entries) => {
  entries.filter((e) => e.isIntersecting).forEach((e, i) => {
    // escalonado: lo que entra a la vez aparece en cascada
    e.target.style.transitionDelay = `${i * 90}ms`;
    e.target.addEventListener('transitionend', () => (e.target.style.transitionDelay = ''), { once: true });
    e.target.classList.add('in');
    if (e.target.dataset.count) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('[data-reveal], [data-count]').forEach((el) => io.observe(el));

// Reels de ReIlloJuan: se reproducen sin sonido solo mientras se ven
const reels = new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.35 });
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('.reel video').forEach((v) => reels.observe(v));

// Formulario: abre el correo del visitante con la solicitud ya escrita
const form = document.getElementById('contact-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const body = `Nombre: ${d.get('nombre')}\nEmail: ${d.get('email')}\nTipo de video: ${d.get('tipo')}\n\n${d.get('vision') || ''}`;
  location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Nueva solicitud · ${d.get('tipo')}`)}&body=${encodeURIComponent(body)}`;
  form.querySelector('.form__note').textContent = '¡Gracias! Se ha abierto tu correo con la solicitud lista para enviar.';
});

// Legal: los enlaces del pie abren su apartado
const openLegal = () => {
  const d = document.getElementById(location.hash.slice(1));
  if (d?.tagName === 'DETAILS') d.open = true;
};
addEventListener('hashchange', openLegal);
openLegal();

// «Configurar cookies»: reabre el aviso de consentimiento de Google (activarlo en AdSense → Privacidad y mensajes)
document.querySelector('[data-cookies]').addEventListener('click', () => {
  window.googlefc = window.googlefc || {};
  googlefc.callbackQueue = googlefc.callbackQueue || [];
  googlefc.callbackQueue.push(() => googlefc.showRevocationMessage?.());
});

document.getElementById('year').textContent = new Date().getFullYear();
