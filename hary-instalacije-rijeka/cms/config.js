/* Postavke uređivača za HARY dom i instalacije (demo, nova stranica) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "HARY dom i instalacije",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "hary-instalacije-rijeka/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/hary-instalacije-rijeka/",
  uploadDir: "img/uploads",
  phone: "+385976567439",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><p class="kick">Nova sekcija</p><h2 class="h2">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".pipe", ".band", ".sym-box"],
  v: 1
};
