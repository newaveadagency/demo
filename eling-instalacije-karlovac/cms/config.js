/* Postavke uređivača za ELING instalacije (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "ELING instalacije",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "eling-instalacije-karlovac/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/eling-instalacije-karlovac/",
  uploadDir: "img/uploads",
  phone: "+385989700603",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.spot{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge i radovi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours]"],
  v: 1
};
