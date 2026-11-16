// ProcureCore email confirmation (/auth/confirm).
//
// The "Confirm your email" email links to /auth/confirm?token_hash=…&type=email.
// When ProcureCore is installed the app opens that link instead and this page
// never shows. When it does show, this script confirms the email itself, then
// discards the session so the website never keeps anyone signed in.
//
// The CSP for this route (netlify.toml) allows exactly this file, the pinned
// supabase-js build below, and connections to the ProcureCore Supabase project.
(function () {
  "use strict";

  var SUPABASE_URL = "https://keplgxmiazyzdetgvzxc.supabase.co";
  // Publishable (anon) key: public by design; access is enforced by RLS.
  // Same value as SUPABASE_PUBLISHABLE_KEY in the app's Config/Supabase.xcconfig.
  var SUPABASE_PUBLISHABLE_KEY = "sb_publishable_q0WWpZ-Dp3MbtFk4tUGpRw_wAz4HVnj";

  // Pinned build + Subresource Integrity. To upgrade: change the version, then
  // regenerate the hash with
  //   curl -s <url> | openssl dgst -sha384 -binary | openssl base64 -A
  // and update the matching script-src path in netlify.toml.
  var SUPABASE_JS_URL =
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";
  var SUPABASE_JS_INTEGRITY =
    "sha384-TcHRA3zBbn+Lexh5n+Oil4guNPOS3rjNDpGRAN46u/s/mB2IZ50ceC6TYDU2yvgK";

  var sections = document.querySelectorAll(".recovery-state[data-state]");

  function show(state) {
    var shown = null;
    Array.prototype.forEach.call(sections, function (section) {
      var match = section.getAttribute("data-state") === state;
      section.hidden = !match;
      if (match) shown = section;
    });
    // Move focus to the new headline so screen readers announce the change.
    // The first, "checking" state is announced by its role="status" instead.
    if (shown && state !== "checking") {
      var heading = shown.querySelector("h1");
      if (heading) heading.focus({ preventScroll: true });
    }
  }

  // Read everything we need from the URL once, then clear it from the address
  // bar and history. Supabase can report errors in the query or the fragment.
  var query = new URLSearchParams(window.location.search);
  var fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  var tokenHash = query.get("token_hash");
  var type = query.get("type");
  var urlHasError =
    query.has("error") ||
    query.has("error_code") ||
    fragment.has("error") ||
    fragment.has("error_code");

  if (window.location.search || window.location.hash) {
    try {
      window.history.replaceState(null, "", window.location.pathname);
    } catch {
      // Leaving the URL in place is harmless; the link is single-use.
    }
  }

  var libraryPromise = null;

  function loadLibrary() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    if (libraryPromise) return libraryPromise;
    libraryPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = SUPABASE_JS_URL;
      script.integrity = SUPABASE_JS_INTEGRITY;
      script.crossOrigin = "anonymous";
      script.onload = function () {
        if (window.supabase && window.supabase.createClient) resolve(window.supabase);
        else reject(new Error("library unavailable"));
      };
      script.onerror = function () {
        script.remove();
        reject(new Error("library failed to load"));
      };
      document.head.appendChild(script);
    }).catch(function (error) {
      libraryPromise = null; // allow "Try again" to fetch it afresh
      throw error;
    });
    return libraryPromise;
  }

  function isNetworkError(lib, error) {
    if (!error) return false;
    if (lib && typeof lib.isAuthRetryableFetchError === "function") {
      if (lib.isAuthRetryableFetchError(error)) return true;
    }
    return error.name === "AuthRetryableFetchError" || error.status === 0;
  }

  var client = null;

  function confirmEmail() {
    show("checking");
    loadLibrary()
      .then(function (lib) {
        if (!client) {
          client = lib.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          });
        }
        return client.auth
          .verifyOtp({ token_hash: tokenHash, type: "email" })
          .then(function (result) {
            if (result.error) {
              show(isNetworkError(lib, result.error) ? "offline" : "expired");
              return;
            }
            return client.auth
              .signOut({ scope: "local" })
              .catch(function () {
                // Nothing is persisted, so a failed local sign-out leaves nothing behind.
              })
              .then(function () {
                show("confirmed");
              });
          });
      })
      .catch(function () {
        // The library didn't load or the request never completed: the link is
        // still unused, so offer to try again.
        show("offline");
      });
  }

  var retry = document.querySelector('[data-action="retry"]');
  if (retry) retry.addEventListener("click", confirmEmail);

  if (urlHasError) {
    show("expired");
  } else if (tokenHash && type === "email") {
    confirmEmail();
  } else {
    show("missing");
  }
})();
