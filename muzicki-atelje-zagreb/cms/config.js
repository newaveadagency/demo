/* Postavke uređivača za Muzički Atelje (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Muzički Atelje",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "muzicki-atelje-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/muzicki-atelje-zagreb/",
  uploadDir: "img/uploads",
  phone: "+385959102412",
  email: "info@muzickiatelje.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative;background:#0d0b26}.hs .track{flex-wrap:wrap;width:auto}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "program.html", name: "Programi i instrumenti" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".progress", ".mesh"],
  v: 1
};
