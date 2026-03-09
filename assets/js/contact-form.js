window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const successCard = document.getElementById("contactFormSuccess");
  if (!form || !successCard) return;

  const url = new URL(window.location.href);
  if (url.searchParams.get("success") !== "1") return;

  form.classList.add("hidden");
  successCard.classList.remove("hidden");

  url.searchParams.delete("success");
  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
});
