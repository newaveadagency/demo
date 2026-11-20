/* Postavke uređivača za La Barbiera (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "La Barbiera",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "la-barbiera-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/la-barbiera-zagreb/",
  uploadDir: "img/uploads",
  phone: "+385957000899",
  email: "",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><p class="kick">Nova sekcija</p><h2 class="big">Novi naslov</h2><p class="lead" style="margin-top:18px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.hs-track{overflow-x:auto}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours] .hrs", "[data-hint]"],
  v: 1
};
