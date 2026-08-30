(async () => {
  const id = document.currentScript && document.currentScript.dataset.case;
  if (!id) return;
  try {
    const r = await fetch('/api/access?id=' + encodeURIComponent(id), { credentials: 'include' });
    const j = await r.json();
    if (!j.ok) location.replace('/?need=' + encodeURIComponent(id));
  } catch {
    location.replace('/?need=' + encodeURIComponent(id));
  }
})();
