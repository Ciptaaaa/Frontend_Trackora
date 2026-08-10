import { useSyncExternalStore } from 'react';
export type Route =
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'boards' }
  | { name: 'board'; boardId: string }
  | { name: 'card'; boardId: string; cardId: string };

const FALLBACK: Route = { name: 'boards' };

export function parseRoute(pathname: string): Route {
  const parts = pathname.split('/').filter((part) => part !== '');

  const [first, second, third, fourth] = parts;

  if (first === undefined) return FALLBACK;
  if (first === 'login' && second === undefined) return { name: 'login' };
  if (first === 'register' && second === undefined) return { name: 'register' };

  if (first === 'boards') {
    if (second === undefined) return { name: 'boards' };
    if (third === undefined) return { name: 'board', boardId: second };
    if (third === 'cards' && fourth !== undefined) {
      return { name: 'card', boardId: second, cardId: fourth };
    }
    return { name: 'board', boardId: second };
  }

  return FALLBACK;
}

export function routePath(route: Route): string {
  switch (route.name) {
    case 'login':
      return '/login';
    case 'register':
      return '/register';
    case 'boards':
      return '/boards';
    case 'board':
      return `/boards/${route.boardId}`;
    case 'card':
      return `/boards/${route.boardId}/cards/${route.cardId}`;
  }
}


type Listener = () => void;
const listeners = new Set<Listener>();
let cachedPath: string | null = null;
let cachedRoute: Route = FALLBACK;

function snapshot(): Route {
  const path = window.location.pathname;
  if (path !== cachedPath) {
    cachedPath = path;
    cachedRoute = parseRoute(path);
  }
  return cachedRoute;
}

function serverSnapshot(): Route {
  return FALLBACK;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let popstateBound = false;

function bindPopstate(): void {
  if (popstateBound || typeof window === 'undefined') return;
  popstateBound = true;
  window.addEventListener('popstate', emit);
}
export function navigate(route: Route, options?: { replace?: boolean }): void {
  const target = routePath(route);
  if (target === window.location.pathname) return;

  if (options?.replace === true) {
    window.history.replaceState(null, '', target);
  } else {
    window.history.pushState(null, '', target);
  }
  emit();
}

export function useRoute(): Route {
  bindPopstate();
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
