/* Postavke uređivača za Autoškolu Kalelarga (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Autoškola Kalelarga",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "autoskola-kalelarga-zadar/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/autoskola-kalelarga-zadar/",
  uploadDir: "img/uploads",
  phone: "+38523315366",
  email: "info@autoskola-kalelarga.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="tag">Nova sekcija</span><h2 style="margin-top:16px;font-size:clamp(32px,4vw,52px)">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "cjenik.html", name: "Cjenik i upis" },
    { file: "vozila.html", name: "Vozila i tim" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
