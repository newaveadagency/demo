/* Postavke uređivača za Energoplast (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Energoplast",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "energoplast-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/energoplast-osijek/",
  uploadDir: "img/uploads",
  phone: "+385998036824",
  email: "mario.ljulj@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:18px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "stolarija.html", name: "Stolarija" },
    { file: "dodaci.html", name: "Rolete i komarnici" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
