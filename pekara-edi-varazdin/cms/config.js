/* Postavke uređivača za Pekaru Edi (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Pekara Edi",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "pekara-edi-varazdin/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/pekara-edi-varazdin/",
  uploadDir: "img/uploads",
  phone: "+38542744198",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "proizvodi.html", name: "Proizvodi" },
    { file: "poslovnice.html", name: "Poslovnice i kontakt" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-morph]", ".sticker"],
  v: 1
};
