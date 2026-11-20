/* Postavke uređivača za Restoran 2Ribara (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Restoran 2Ribara",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "dva-ribara-zadar/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/dva-ribara-zadar/",
  uploadDir: "img/uploads",
  phone: "+38523213445",
  email: "info@2ribara.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "jelovnik.html", name: "Jelovnik i vina" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
