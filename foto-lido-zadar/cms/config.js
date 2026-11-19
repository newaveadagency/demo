/* Postavke uređivača za Foto Lido (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Foto Lido",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "foto-lido-zadar/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/foto-lido-zadar/",
  uploadDir: "img/uploads",
  phone: "+38598843251",
  email: "zadarfoto@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap" style="padding:90px 0"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px;font-size:44px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.glow{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
