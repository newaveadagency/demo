/* Postavke uređivača za Kosport Bike Shop & Servis (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Kosport Bike Shop & Servis",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "kosport-strahoninec/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/kosport-strahoninec/",
  uploadDir: "img/uploads",
  phone: "+385915694731",
  email: "davor@kosport.com.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "bicikli.html", name: "Bicikli i oprema" },
    { file: "servis.html", name: "Servis" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-spin]", "[data-hours]"],
  v: 1
};
