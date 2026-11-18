/* Postavke uređivača za Vinariju Krolo (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Vinarija Krolo",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "vinarija-krolo/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/vinarija-krolo/",
  uploadDir: "img/uploads",
  phone: "+385992281809",
  email: "vinarija.krolo@gmail.com",
  buttonClass: "btn btn-gold",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:absolute}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "vina.html", name: "Vina" },
    { file: "degustacije.html", name: "Degustacije" }
  ],
  dynamic: {},
  locked: ["[data-count]"],
  v: 1
};
