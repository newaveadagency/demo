/* Postavke uređivača za Staklorad Osijek (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Staklorad",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "staklorad-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/staklorad-osijek/",
  uploadDir: "img/uploads",
  phone: "+38598513101",
  email: "info@staklorad.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "radovi.html", name: "Radovi" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".hours tr"],
  v: 1
};
