/* Postavke uređivača za Sintagmu Split (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Sintagma",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "sintagma-split/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/sintagma-split/",
  uploadDir: "img/uploads",
  phone: "+38521783422",
  email: "info@jcs.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "tecajevi.html", name: "Tečajevi" },
    { file: "prijevodi.html", name: "Prijevodi i tumači" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hello]"],
  v: 1
};
