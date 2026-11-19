/* Postavke uređivača za Knjigovodstveni servis SKLAD (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Knjigovodstveni servis SKLAD",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "knjigovodstvo-sklad-sisak/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/knjigovodstvo-sklad-sisak/",
  uploadDir: "img/uploads",
  phone: "+385915061537",
  email: "ana@knjigovodstvo-sklad.com",
  buttonClass: "btn btn-v",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><div class="sec-head"><p class="lab"><b>00</b> — Nova sekcija</p><h2 class="h2">Novi naslov</h2><p class="lead">Kliknite ovdje i upišite tekst.</p></div></div>',
  canvasCss: ".nav{position:absolute}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]"],
  v: 1
};
