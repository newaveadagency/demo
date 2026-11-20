/* Postavke uređivača za HM workshop (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "HM workshop",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "hm-workshop-vinkovci/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/hm-workshop-vinkovci/",
  uploadDir: "img/uploads",
  phone: "+385953832227",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "radovi.html", name: "Radovi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-ba]", ".ba-before"],
  v: 1
};
