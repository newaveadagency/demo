/* Postavke uređivača za Plesni centar Beat (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Plesni centar Beat",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "plesni-centar-beat-rijeka/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/plesni-centar-beat-rijeka/",
  uploadDir: "img/uploads",
  phone: "+385914005503",
  email: "info@plesnicentarbeat.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.hero{min-height:auto}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "programi.html", name: "Programi i upisi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-rot]", "[data-hgal]", "[data-hbar]"],
  v: 1
};
