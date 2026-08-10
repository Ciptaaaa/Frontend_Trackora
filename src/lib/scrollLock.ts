let locks = 0;

export function lockBodyScroll(): () => void {
  locks += 1;
  document.body.style.overflow = 'hidden';

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = '';
  };
}
