/* Postavke uređivača za PIPE PLAN d.o.o. (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "PIPE PLAN d.o.o.",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "pipe-plan-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/pipe-plan-zagreb/",
  uploadDir: "img/uploads",
  phone: "+385953567140",
  email: "lovricinfo@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2>Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.marquee .track{animation:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge i reference" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".pipe-run", ".ba input"],
  v: 1
};
