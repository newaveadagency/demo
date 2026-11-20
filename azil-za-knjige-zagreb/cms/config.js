/* Postavke uređivača za Azil za knjige (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Azil za knjige",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "azil-za-knjige-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/azil-za-knjige-zagreb/",
  uploadDir: "img/uploads",
  phone: "+385914009140",
  email: "info@azilzaknjige.hr",
  buttonClass: "btn btn-green",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><p class="caps">Nova sekcija</p><h2 class="big" style="margin:14px 0 18px">Novi naslov</h2><p class="lead">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.marq-track{animation:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "udzbenici.html", name: "Udžbenici" }
  ],
  dynamic: {},
  locked: ["[data-open]", "[data-hours] tr"],
  v: 1
};
