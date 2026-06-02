/**
 * gestures.js — Tuŝ-/musa gest-administrado por Gova
 *
 * Eltirita el app.js. La stat-maŝino restas laŭvorte la sama (samaj sojloj
 * kaj flagoj); ĝi nur eligas semantikajn eventojn per revokoj, kaj la apo
 * decidas kion fari (montri indikilon, ŝanĝi ekranon, refreŝigi, ktp.).
 *
 * Uzo:
 *   Gestures.init(el, {
 *     onTap, onLongPress,
 *     onSwipe(direction),       // 'left' | 'right'
 *     onPullStart(),            // malsupren-tiro/svingo komenciĝis
 *     onPullMove(passed),       // dum tiro; passed = ĉu trans sojlo
 *     onPullRelease(triggered), // ellaso; triggered = ĉu refreŝigi
 *   }, { canPull: () => boolean });
 */

const Gestures = (() => {
  const LONG_PRESS_DURATION = 500;
  const PULL_THRESHOLD = 80;   // tiro de supro
  const SWIPE_THRESHOLD = 50;  // svingo malsupren / horizontala

  function init(el, cb = {}, opts = {}) {
    if (!el) return;
    const canPull = opts.canPull || (() => true);

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isPulling = false;
    let isSwiping = false;
    let isSwipingDown = false;
    let isMouseDown = false;
    let longPressTimer = null;

    function _start(e) {
      if (!e.touches) isMouseDown = true;
      touchStartX = e.touches ? e.touches[0].clientX : e.clientX;
      touchStartY = e.touches ? e.touches[0].clientY : e.clientY;
      touchStartTime = Date.now();
      isPulling = false;
      isSwiping = false;
      isSwipingDown = false;

      longPressTimer = setTimeout(() => {
        if (!isSwiping && !isPulling && !isSwipingDown) {
          cb.onLongPress?.();
        }
      }, LONG_PRESS_DURATION);
    }

    function _move(e) {
      if (!e.touches && !isMouseDown) return;

      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const currentY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;

      if (!isPulling && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 15) {
        isSwiping = true;
        clearTimeout(longPressTimer);
      }

      if (!isSwiping && canPull()) {
        if (deltaY > 10 && touchStartY < 100) {
          if (!isPulling) {
            isPulling = true;
            isSwipingDown = false;
            clearTimeout(longPressTimer);
            cb.onPullStart?.();
          }
          cb.onPullMove?.(deltaY >= PULL_THRESHOLD);
        } else if (deltaY > 15 && Math.abs(deltaY) > Math.abs(deltaX)) {
          if (!isSwipingDown) {
            isSwipingDown = true;
            clearTimeout(longPressTimer);
            cb.onPullStart?.();
          }
          cb.onPullMove?.(deltaY >= SWIPE_THRESHOLD);
        }
      }
    }

    function _end(e) {
      if (!e.changedTouches) isMouseDown = false;
      const touchDuration = Date.now() - touchStartTime;
      const currentX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const currentY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
      const deltaX = currentX - touchStartX;

      clearTimeout(longPressTimer);

      if (isPulling) {
        cb.onPullRelease?.(currentY - touchStartY >= PULL_THRESHOLD);
        isPulling = false;
        return;
      }

      if (isSwiping) {
        if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
          cb.onSwipe?.(deltaX > 0 ? 'right' : 'left');
        }
        isSwiping = false;
        return;
      }

      if (isSwipingDown) {
        cb.onPullRelease?.(currentY - touchStartY >= SWIPE_THRESHOLD);
        isSwipingDown = false;
        return;
      }

      if (touchDuration < LONG_PRESS_DURATION) cb.onTap?.();
    }

    el.addEventListener('touchstart', _start, { passive: true });
    el.addEventListener('touchend', _end, { passive: true });
    el.addEventListener('touchmove', _move, { passive: true });
    el.addEventListener('mousedown', _start);
    el.addEventListener('mousemove', _move);
    el.addEventListener('mouseup', _end);
    el.addEventListener('mouseleave', _end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  return { init };
})();
