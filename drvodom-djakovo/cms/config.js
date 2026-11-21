/* Postavke uređivača za Drvodom Đakovo (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Drvodom Đakovo",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "drvodom-djakovo/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/drvodom-djakovo/",
  uploadDir: "img/uploads",
  phone: "+385998792843",
  email: "info@drvodom.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 class="h2" style="margin-top:18px">Novi naslov</h2><p class="lead" style="margin-top:18px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "galerija.html", name: "Projekti" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".leaf"],
  v: 1
};
