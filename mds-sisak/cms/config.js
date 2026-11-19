/* Postavke uređivača za MDS Sisak (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "MDS Sisak",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "mds-sisak/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/mds-sisak/",
  uploadDir: "img/uploads",
  phone: "+385919439301",
  email: "info@mds-sisak.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap" style="padding:100px 24px"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge i radovi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-parallax]"],
  v: 1
};
