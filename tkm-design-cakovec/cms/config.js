/* Postavke uređivača za TKM-design (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "TKM-design",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "tkm-design-cakovec/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/tkm-design-cakovec/",
  uploadDir: "img/uploads",
  phone: "+385915100531",
  email: "tkm-design@mail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap" style="padding:90px 24px"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "projekti.html", name: "Projekti" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-rail]", "[data-parallax]"],
  v: 1
};
