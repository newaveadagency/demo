/* Postavke uređivača za Grill Palić (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Grill Palić",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "grill-palic-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/grill-palic-zagreb/",
  uploadDir: "img/uploads",
  phone: "+38512987156",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><p class="kick"><b>00</b> Nova sekcija</p><h2 class="big" style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:18px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.tools{position:relative;top:0}.grid-bg{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "jelovnik.html", name: "Jelovnik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours] tr", "[data-basket]", "[data-empty]"],
  v: 1
};
