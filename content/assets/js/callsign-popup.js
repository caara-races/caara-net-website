(() => {
  let popup = null;
  let popupOwner = null;

  function showPopup(el) {
    if (popup && popupOwner === el) return;
    if (popup) popup.remove();

    const call = el.dataset.call;
    const name = el.dataset.name;
    const cls = el.dataset.class;
    const city = el.dataset.city;
    const grid = el.dataset.grid;

    popup = document.createElement("div");
    popup.className = "callsign-popup";

    let html = `<div class="popup-call">${escapeHtml(call)}</div><dl>`;

    if (cls) html += `<dt>Class</dt><dd>${escapeHtml(cls)}</dd>`;
    if (name) html += `<dt>Name</dt><dd>${escapeHtml(name)}</dd>`;
    if (city) html += `<dt>QTH</dt><dd>${escapeHtml(city)}</dd>`;
    if (grid) {
      const gridUrl = `https://k7fry.com/grid/?t=n&qth=${encodeURIComponent(grid)}`;
      html += `<dt>Grid</dt><dd><a href="${gridUrl}">${escapeHtml(grid)}</a></dd>`;
    }

    html += "</dl>";
    popup.innerHTML = html;
    el.appendChild(popup);
    popupOwner = el;
  }

  function hidePopup() {
    if (popup) {
      popup.remove();
      popup = null;
      popupOwner = null;
    }
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener(
    "mouseenter",
    (e) => {
      const el = e.target.closest(".callsign[data-call]");
      if (el) showPopup(el);
    },
    true,
  );

  document.addEventListener(
    "mouseleave",
    (e) => {
      const el = e.target.closest(".callsign[data-call]");
      if (el && (!e.relatedTarget || !el.contains(e.relatedTarget)))
        hidePopup();
    },
    true,
  );

  document.addEventListener("focusin", (e) => {
    const el = e.target.closest(".callsign[data-call]");
    if (el) showPopup(el);
  });

  document.addEventListener("focusout", (e) => {
    const el = e.target.closest(".callsign[data-call]");
    if (el) hidePopup();
  });
})();
