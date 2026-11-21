/* Postavke uređivača za Autoškolu DUNAV-VUKOVAR (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Autoškola DUNAV-VUKOVAR",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "autoskola-dunav-vukovar/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/autoskola-dunav-vukovar/",
  uploadDir: "img/uploads",
  phone: "+385981815455",
  email: "dunav-vu@vk.t-com.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:14px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.hs-track{overflow-x:auto}@media (max-width:1100px){.menu{display:flex;position:static;height:auto;width:auto;flex-direction:row;flex-wrap:wrap;padding:0;background:none;box-shadow:none;z-index:auto}}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "vozila.html", name: "Vozni park" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", "[data-rotate]"],
  v: 1
};
