/* Postavke uređivača za Popaj Fitness Zadar (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Popaj Fitness",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "popaj-fitness-zadar/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/popaj-fitness-zadar/",
  uploadDir: "img/uploads",
  phone: "+38523325008",
  email: "fitness.klub.popaj@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.hgal .viewport{overflow-x:auto}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "raspored.html", name: "Raspored" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours]"],
  v: 1
};
