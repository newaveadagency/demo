/* Postavke uređivača za Dječji vrtić Nemo (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Dječji vrtić Nemo",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "vrtic-nemo-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/vrtic-nemo-zagreb/",
  uploadDir: "img/uploads",
  phone: "+38513668815",
  email: "nemovrtic@gmail.com",
  buttonClass: "btn btn-coral",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="lbl">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "programi.html", name: "Programi i prehrana" },
    { file: "upisi.html", name: "Upisi i roditelji" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".marq-track"],
  v: 1
};
