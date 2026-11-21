/* Postavke uređivača za Ordinacije Prpić (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Ordinacije Prpić",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "prpic-dental-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/prpic-dental-osijek/",
  uploadDir: "img/uploads",
  phone: "+38531210244",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".hdr{position:relative}.hero{min-height:0}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-today-list]", "[data-today-date]"],
  v: 1
};
