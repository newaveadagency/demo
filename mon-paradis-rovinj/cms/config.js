/* Postavke uređivača za Mini kamp Mon Paradis (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Mini kamp Mon Paradis",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "mon-paradis-rovinj/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/mon-paradis-rovinj/",
  uploadDir: "img/uploads",
  phone: "+385917903587",
  email: "mmonparadis@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:absolute}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "cjenik.html", name: "Cjenik i uvjeti" },
    { file: "galerija.html", name: "Galerija" }
  ],
  dynamic: {},
  locked: ["[data-count]"],
  v: 1
};
