/* Postavke uređivača za Mesnice Borošak (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Mesnice Borošak",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "mesnice-borosak-klanjec/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/mesnice-borosak-klanjec/",
  uploadDir: "img/uploads",
  phone: "+38549550254",
  email: "mesnice.borosak@hi.ht.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "ponuda.html", name: "Ponuda" },
    { file: "prodavaonice.html", name: "Prodavaonice" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-hours]"],
  v: 1
};
