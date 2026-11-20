/* Postavke uređivača za Glazbenu školu Brkanović (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Glazbena škola Brkanović",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "glazbena-skola-brkanovic-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/glazbena-skola-brkanovic-zagreb/",
  uploadDir: "img/uploads",
  phone: "+385958356708",
  email: "info@glazbenaskolabrkanovic.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "programi.html", name: "Programi" },
    { file: "upisi.html", name: "Upisi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-rot]"],
  v: 1
};
