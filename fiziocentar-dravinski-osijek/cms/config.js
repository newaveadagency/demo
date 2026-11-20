/* Postavke uređivača za FizioCentar Dravinski (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "FizioCentar Dravinski",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "fiziocentar-dravinski-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/fiziocentar-dravinski-osijek/",
  uploadDir: "img/uploads",
  phone: "+385959074294",
  email: "dravinski.m@gmail.com",
  buttonClass: "btn btn-sand",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="caps">Nova sekcija</span><h2 class="big" style="margin:14px 0 18px">Novi naslov</h2><p class="lead">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.glow{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge i cijene" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours] tr"],
  v: 1
};
