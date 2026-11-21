/* Postavke uređivača za Pansion Winnetou (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Pansion Winnetou",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "pansion-winnetou-plitvice/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/pansion-winnetou-plitvice/",
  uploadDir: "img/uploads",
  phone: "+385953744741",
  email: "pansionwinnetou@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "sobe.html", name: "Sobe" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-wheel]", ".seal"],
  v: 1
};
