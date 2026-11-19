import { $, h, holdButton, icons } from './ui';
import { sfx } from './audio';
import { kikoSvg } from './kiko';
import { deleteArt, listArt, type Art } from './store';
import type { Nav, Screen } from './main';

export function gallery(nav: Nav): Screen {
  const el = h(`
    <div class="screen gallery">
      <header class="bar">
        <button class="btn round" id="gallery-home" aria-label="Home">${icons.home}</button>
        <h2 class="title small" data-text="My Art">My Art</h2>
      </header>
      <div class="wall"></div>
    </div>`);
  const wall = $(el, '.wall');
  const urls = new Map<string, string>();
  let alive = true;

  const render = async () => {
    const arts = await listArt();
    if (!alive) return;
    for (const u of urls.values()) URL.revokeObjectURL(u);
    urls.clear();
    wall.innerHTML = '';
    wall.classList.toggle('is-empty', arts.length === 0);
    if (arts.length === 0) {
      const empty = h(`
        <div class="empty">
          ${kikoSvg('empty-kiko')}
          <p>No pictures yet. Draw one and tap the heart to keep it here.</p>
          <button class="door door-draw">${icons.brush}<span>Draw</span></button>
        </div>`);
      $(empty, '.door').addEventListener('click', () => {
        sfx.pop();
        nav('studio');
      });
      wall.appendChild(empty);
      return;
    }
    arts.forEach((art, i) => {
      const url = URL.createObjectURL(art.full);
      urls.set(art.id, url);
      const card = h(`<button class="card" style="--tilt:${[-2, 1.5, -1, 2.5, -1.5][i % 5]}deg" aria-label="Picture ${i + 1}"><img src="${url}" alt=""></button>`);
      card.addEventListener('click', () => {
        sfx.pop();
        view(art, url);
      });
      wall.appendChild(card);
    });
  };

  const view = (art: Art, url: string) => {
    const o = h(`
      <div class="overlay viewer">
        <figure class="frame big"><img src="${url}" alt="Your picture"></figure>
        <div class="viewer-actions">
          <button class="door door-draw" id="draw-more">${icons.brush}<span>Draw more</span></button>
          <button class="door hold" id="delete-art">${icons.trash}<span>Hold to delete</span></button>
          <button class="btn round" id="close-viewer" aria-label="Close">${icons.close}</button>
        </div>
      </div>`);
    $(o, '#draw-more').addEventListener('click', () => {
      sfx.pop();
      nav('studio', { artId: art.id });
    });
    holdButton($(o, '#delete-art'), 1400, () => {
      sfx.whoosh();
      void deleteArt(art.id).then(() => {
        o.remove();
        void render();
      });
    });
    $(o, '#close-viewer').addEventListener('click', () => {
      sfx.pop();
      o.remove();
    });
    el.appendChild(o);
  };

  $(el, '#gallery-home').addEventListener('click', () => {
    sfx.pop();
    nav('home');
  });

  void render();

  return {
    el,
    destroy() {
      alive = false;
      for (const u of urls.values()) URL.revokeObjectURL(u);
    },
  };
}
