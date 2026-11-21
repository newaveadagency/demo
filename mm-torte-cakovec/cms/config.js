/* Postavke uređivača za MM torte (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "MM torte",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "mm-torte-cakovec/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/mm-torte-cakovec/",
  uploadDir: "img/uploads",
  phone: "+385995086762",
  email: "info@mmtorte.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "torte.html", name: "Torte i galerija" },
    { file: "narudzba.html", name: "Naručivanje" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
