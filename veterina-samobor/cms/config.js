/* Postavke uređivača za Veterinarsku stanicu Samobor (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Veterinarska stanica Samobor",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "veterina-samobor/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/veterina-samobor/",
  uploadDir: "img/uploads",
  phone: "+38513363315",
  email: "veterina@veterina-samobor.hr",
  buttonClass: "btn btn-teal",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="lbl">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "prva-pomoc.html", name: "Prva pomoć" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".marq-track"],
  v: 1
};
