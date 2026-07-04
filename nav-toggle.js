(function () {
  var toggle = document.getElementById('navToggle');
  var links = document.querySelector('.navbar .nav-links');
  if (!toggle || !links) return;

  function setOpen(isOpen) {
    links.classList.toggle('is-open', isOpen);
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  }

  toggle.addEventListener('click', function () {
    setOpen(!links.classList.contains('is-open'));
  });

  links.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      setOpen(false);
    });
  });

  document.addEventListener('click', function (event) {
    if (!links.classList.contains('is-open')) return;
    if (links.contains(event.target) || toggle.contains(event.target)) return;
    setOpen(false);
  });
})();
