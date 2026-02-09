// javascrip.js — single-photo carousel + lightbox
(function () {
  const track = document.querySelector('.gallery-track');
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');

  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lb-image');
  const lbClose = document.querySelector('.lb-close');
  const lbPrev = document.querySelector('.lb-prev');
  const lbNext = document.querySelector('.lb-next');

  if (!track) return;

  // get number of items and current index
  const items = Array.from(track.querySelectorAll('.gallery-item'));
  let currentIndex = 0;

  // Scroll the track so that the item at index is visible
  function showIndex(index, smooth = true) {
    index = Math.max(0, Math.min(items.length - 1, index));
    currentIndex = index;
    const first = items[index];
    if (!first) return;
    const left = first.offsetLeft - track.offsetLeft;
    track.scrollTo({ left: left, behavior: smooth ? 'smooth' : 'auto' });
    updateButtonsVisibility();
  }

  // Prev/Next scroll actions
  function scrollPrev() { showIndex(currentIndex - 1); }
  function scrollNext() { showIndex(currentIndex + 1); }

  prevBtn && prevBtn.addEventListener('click', scrollPrev);
  nextBtn && nextBtn.addEventListener('click', scrollNext);

  // Update currentIndex on manual scroll (so arrow opens correct image)
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // find the item closest to center of track viewport
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      items.forEach((el, i) => {
        const elCenter = el.offsetLeft + el.offsetWidth / 2;
        const dist = Math.abs(trackCenter - elCenter);
        if (dist < closestDist) { closestDist = dist; closestIndex = i; }
      });
      currentIndex = closestIndex;
      updateButtonsVisibility();
    }, 80);
  });

  // Click to open lightbox
  track.addEventListener('click', (e) => {
    const img = e.target.closest('.gallery-item img');
    if (!img) return;
    const clickedItem = e.target.closest('.gallery-item');
    const index = items.indexOf(clickedItem);
    openLightbox(index);
  });

  // Lightbox functions
  function openLightbox(index) {
    index = Math.max(0, Math.min(items.length - 1, index));
    const imgEl = items[index].querySelector('img');
    if (!imgEl) return;
    lbImage.src = imgEl.src;
    lbImage.alt = imgEl.alt || '';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    currentIndex = index;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lbImage.src = '';
  }

  function lbPrevHandler() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    const imgEl = items[currentIndex].querySelector('img');
    lbImage.src = imgEl.src;
    lbImage.alt = imgEl.alt || '';
  }

  function lbNextHandler() {
    currentIndex = (currentIndex + 1) % items.length;
    const imgEl = items[currentIndex].querySelector('img');
    lbImage.src = imgEl.src;
    lbImage.alt = imgEl.alt || '';
  }

  lbClose && lbClose.addEventListener('click', closeLightbox);
  lbPrev && lbPrev.addEventListener('click', lbPrevHandler);
  lbNext && lbNext.addEventListener('click', lbNextHandler);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lbPrevHandler();
      if (e.key === 'ArrowRight') lbNextHandler();
    } else {
      // when not in lightbox, left/right should navigate track if focused
      if (document.activeElement === track) {
        if (e.key === 'ArrowLeft') showIndex(currentIndex - 1);
        if (e.key === 'ArrowRight') showIndex(currentIndex + 1);
      }
    }
  });

  // Lightbox swipe support
  (function setupLightboxSwipe() {
    let startX = 0, isDown = false;
    lightbox.addEventListener('pointerdown', (e) => {
      isDown = true; startX = e.pageX;
      if (lightbox.setPointerCapture) lightbox.setPointerCapture(e.pointerId);
    });
    lightbox.addEventListener('pointermove', (e) => {
      if (!isDown) return;
    });
    lightbox.addEventListener('pointerup', (e) => {
      if (!isDown) return;
      const dx = e.pageX - startX;
      isDown = false;
      if (dx > 40) lbPrevHandler();
      else if (dx < -40) lbNextHandler();
    });
    lightbox.addEventListener('pointercancel', () => { isDown = false; });
  })();

  // Edge button visibility for gallery arrows
  function updateButtonsVisibility() {
    if (!prevBtn || !nextBtn) return;
    prevBtn.style.visibility = currentIndex > 0 ? 'visible' : 'hidden';
    nextBtn.style.visibility = currentIndex < items.length - 1 ? 'visible' : 'hidden';
  }

  // Initialize: show first index without smooth scroll
  showIndex(0, false);
})();

// mobile nav show/hide helpers
function showMenu() {
  const nav = document.querySelector('nav');
  const navLinks = document.getElementById('navLinks');
  if (!nav || !navLinks) return;
  nav.classList.add('nav-open');
  navLinks.classList.add('open');
  document.body.style.overflow = 'hidden'; // optional: prevent background scroll
}

function hideMenu() {
  const nav = document.querySelector('nav');
  const navLinks = document.getElementById('navLinks');
  if (!nav || !navLinks) return;
  nav.classList.remove('nav-open');
  navLinks.classList.remove('open');
  document.body.style.overflow = '';
}

// close menu when a nav link is clicked (mobile UX)
document.addEventListener('click', function (e) {
  const clickedLink = e.target.closest('.nav-links ul li a');
  if (clickedLink && window.innerWidth <= 900) {
    hideMenu();
  }
});

// ensure menu closes after clicking an in-page link
document.querySelectorAll('.nav-links a[href^="#"]').forEach(a => {
  a.addEventListener('click', () => {
    hideMenu();
  });
});