/* Postavke uređivača za Studio Vitalis (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Studio Vitalis",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "studio-vitalis-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/studio-vitalis-osijek/",
  uploadDir: "img/uploads",
  phone: "+385993240907",
  email: "info@studiovitalis.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
