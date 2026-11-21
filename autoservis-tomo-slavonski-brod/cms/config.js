/* Postavke uređivača za Autoservis i vučnu službu Tomo (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Autoservis i vučna služba Tomo",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "autoservis-tomo-slavonski-brod/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/autoservis-tomo-slavonski-brod/",
  uploadDir: "img/uploads",
  phone: "+385959076084",
  email: "tomo.vucnasluzba@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.chips{position:relative;top:0}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours]", "#roadTruck"],
  v: 1
};
