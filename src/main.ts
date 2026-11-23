import './style.css';
import { home } from './home';
import { studio } from './studio';
import { gallery } from './gallery';
import { unlockAudio } from './audio';
import { warmVoice } from './voice';

export interface Screen {
  el: HTMLElement;
  destroy?: () => void;
}
export type Route = 'home' | 'studio' | 'gallery';
export type Nav = (to: Route, params?: { artId?: string }) => void;

const app = document.getElementById('app') as HTMLElement;
let current: Screen | null = null;

const nav: Nav = (to, params) => {
  current?.destroy?.();
  current?.el.remove();
  current = to === 'studio' ? studio(nav, params) : to === 'gallery' ? gallery(nav) : home(nav);
  app.appendChild(current.el);
};

// Long-presses and stray gestures should never pop a browser menu in front of a child.
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('dragstart', (e) => e.preventDefault());

// On phones the browser's address and tool bars cover part of the page, and "100%" can
// include the hidden part. Size the app to what is really visible, and keep it pinned there.
const fitToVisibleScreen = () => {
  const visible = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--visible-height', `${Math.round(visible)}px`);
  window.scrollTo(0, 0);
};
fitToVisibleScreen();
window.addEventListener('resize', fitToVisibleScreen);
window.addEventListener('orientationchange', () => window.setTimeout(fitToVisibleScreen, 300));
window.visualViewport?.addEventListener('resize', fitToVisibleScreen);

unlockAudio(warmVoice);
nav('home');
