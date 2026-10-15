/* The video chapters refer to the original supplementary video timeline. */
if (window.lucide) lucide.createIcons();
const video = document.getElementById('vid');
const chapters = [...document.querySelectorAll('[data-time]')];
const videoStatus = document.getElementById('video-status');
chapters.forEach(button => button.addEventListener('click', async () => {
  if (video.readyState === 0) {
    await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, { once: true }));
  }
  video.currentTime = Number(button.dataset.time);
  try { await video.play(); videoStatus.textContent = ''; }
  catch { videoStatus.textContent = 'Playback is paused. Use the video play control to continue.'; }
}));
video.addEventListener('timeupdate', () => {
  const index = chapters.findLastIndex(button => video.currentTime >= Number(button.dataset.time));
  chapters.forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
});
video.addEventListener('error', () => {
  videoStatus.textContent = 'The video could not be loaded. Please reload the page and try again.';
});
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
  const target = document.getElementById(link.getAttribute('href').slice(1));
  if (target?.closest('details')) target.closest('details').open = true;
}));
const copyButton = document.getElementById('copy-bib');
const copyStatus = document.getElementById('copy-status');
copyButton.addEventListener('click', async () => {
  const text = document.getElementById('bib-text').textContent;
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.appendChild(field); field.select();
      const success = document.execCommand('copy'); field.remove();
      if (!success) throw new Error('Clipboard unavailable');
    }
    copyStatus.textContent = 'BibTeX copied.';
  } catch {
    const range = document.createRange(); range.selectNodeContents(document.getElementById('bib-text'));
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    copyStatus.textContent = 'BibTeX selected. Copy with your browser or keyboard.';
  }
});
document.querySelector('.method-details').addEventListener('toggle', event => {
  if (event.currentTarget.open && window.MathJax?.typesetPromise) {
    MathJax.typesetPromise([event.currentTarget]).catch(() => {});
  }
});
