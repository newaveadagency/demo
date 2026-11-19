/* Postavke uređivača za Hair Gallery Pula (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Hair Gallery",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "hair-gallery-pula/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/hair-gallery-pula/",
  uploadDir: "img/uploads",
  phone: "+38598608499",
  email: "info@hairgallery.com.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "galerija.html", name: "Galerija" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours]", ".lb"],
  v: 1
};
