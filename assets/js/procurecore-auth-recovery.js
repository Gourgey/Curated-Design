// ProcureCore password-reset fallback (/auth/recovery).
//
// The app opens reset links itself and uses the one-time reset details, so
// this script must never make any network request. It only checks
// whether the URL reports an error (for example an expired link) and, if so,
// shows the "expired" message instead of the default one.
(function () {
  "use strict";

  var query = new URLSearchParams(window.location.search);
  var fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  var hasError =
    query.has("error") ||
    query.has("error_code") ||
    fragment.has("error") ||
    fragment.has("error_code");
  if (!hasError) return;

  var sections = document.querySelectorAll(".recovery-state[data-state]");
  Array.prototype.forEach.call(sections, function (section) {
    section.hidden = section.getAttribute("data-state") !== "expired";
  });
})();
