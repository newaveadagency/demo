/* Postavke uređivača za K.G.B. instalacije (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "K.G.B. instalacije",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "kgb-instalacije-split/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/kgb-instalacije-split/",
  uploadDir: "img/uploads",
  phone: "+385911462468",
  email: "kgbinstalacije@yahoo.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 class="h2">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "bazeni.html", name: "Bazeni i oprema" },
    { file: "odrzavanje.html", name: "Održavanje" }
  ],
  dynamic: {},
  locked: ["[data-count]"],
  v: 1
};
