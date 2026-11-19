import './style.css';
import { home } from './home';
import { studio } from './studio';
import { gallery } from './gallery';

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

nav('home');
