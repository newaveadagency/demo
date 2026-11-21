/* Postavke uređivača za Veterinarsku stanicu Požega (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Veterinarska stanica Požega",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "veterinarska-stanica-pozega/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/veterinarska-stanica-pozega/",
  uploadDir: "img/uploads",
  phone: "+38534211612",
  email: "pozega@veterinarska-pozega.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:18px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-loc-status]", ".pix", ".steps svg.line"],
  v: 1
};
