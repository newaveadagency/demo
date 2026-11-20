/* Postavke uređivača za Pizzeriu Sebastian (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Pizzeria Sebastian",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "pizzeria-sebastian-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/pizzeria-sebastian-osijek/",
  uploadDir: "img/uploads",
  phone: "+38531570904",
  email: "pizzeria.os.sebastian@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px;font-size:clamp(32px,4vw,56px)">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.grid-bg{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "jelovnik.html", name: "Jelovnik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-year]", ".hero-tag"],
  v: 1
};
