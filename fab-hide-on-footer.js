(function () {
  var fab = document.querySelector('.mobile-call-fab');
  if (!fab) return;

  var targets = [];
  var contactSection = document.querySelector('.direct-contact') || document.getElementById('contacts');
  var footer = document.querySelector('.site-footer');

  if (contactSection) targets.push(contactSection);
  if (footer) targets.push(footer);
  if (!targets.length) return;

  var visible = false;

  var observer = new IntersectionObserver(function (entries) {
    var anyVisible = false;
    entries.forEach(function (entry) {
      if (entry.isIntersecting) anyVisible = true;
    });

    if (!anyVisible) {
      targets.forEach(function (t) {
        var rect = t.getBoundingClientRect();
        var vh = window.innerHeight;
        if (rect.top < vh && rect.bottom > 0) anyVisible = true;
      });
    }

    if (anyVisible && !visible) {
      visible = true;
      fab.classList.add('is-hidden-by-footer');
    } else if (!anyVisible && visible) {
      visible = false;
      fab.classList.remove('is-hidden-by-footer');
    }
  }, { root: null, threshold: 0 });

  targets.forEach(function (t) {
    observer.observe(t);
  });
})();
