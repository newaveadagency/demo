/* Postavke uređivača za Kulaš Rent a Boat (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Kulaš Rent a Boat",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "rent-a-boat-kulas-biograd/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/rent-a-boat-kulas-biograd/",
  uploadDir: "img/uploads",
  phone: "+38598895129",
  email: "kulas.rentals@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "flota.html", name: "Flota" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-parallax]"],
  v: 1
};
