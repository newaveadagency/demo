/* Postavke uređivača za Umjetnički namještaj Meštrović (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Umjetnički namještaj Meštrović",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "namjestaj-mestrovic-marija-bistrica/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/namjestaj-mestrovic-marija-bistrica/",
  uploadDir: "img/uploads",
  phone: "+385917907084",
  email: "mladen.mestrovic1@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px;color:var(--oak)">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "radovi.html", name: "Radovi" }
  ],
  dynamic: {},
  locked: ["[data-open]", "[data-hours]", ".seal", ".band"],
  v: 1
};
