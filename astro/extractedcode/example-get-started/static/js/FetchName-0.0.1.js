class FetchName {
  constructor() {
    const id = JSON.parse(decodeURIComponent(document.cookie.split("; ").find((row) => row.startsWith("id="))?.split("=")[1]));
    document.querySelector('.header-email').innerHTML = `Welcome: ${id.given_name} (${id.email})`;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new FetchName();
});
