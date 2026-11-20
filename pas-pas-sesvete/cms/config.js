/* Postavke uređivača za PAS&PAS salon za pse (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "PAS&PAS salon za pse",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "pas-pas-sesvete/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/pas-pas-sesvete/",
  uploadDir: "img/uploads",
  phone: "+385994505049",
  email: "pasundpas@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><p class="kick">Nova sekcija</p><h2 class="big">Novi naslov</h2><p class="lead" style="margin-top:18px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "cjenik.html", name: "Cjenik i pravila" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours] tr"],
  v: 1
};
