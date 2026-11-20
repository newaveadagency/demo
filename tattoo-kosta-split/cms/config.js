/* Postavke uređivača za Tattoo studio Kosta (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Tattoo studio Kosta",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "tattoo-kosta-split/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/tattoo-kosta-split/",
  uploadDir: "img/uploads",
  phone: "+385917552264",
  email: "tattoo.kosta@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "studio.html", name: "O studiju" },
    { file: "radovi.html", name: "Radovi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
