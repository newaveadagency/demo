/* Postavke uređivača za OPG Vrljić (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "OPG Vrljić",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "opg-vrljic-slavonski-brod/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/opg-vrljic-slavonski-brod/",
  uploadDir: "img/uploads",
  phone: "+385914610666",
  email: "opgvrljic@net.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.cart{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "proizvodi.html", name: "Proizvodi i cijene" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-jarname]", "[data-cart]"],
  v: 1
};
