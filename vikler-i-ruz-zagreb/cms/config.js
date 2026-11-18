/* Postavke uređivača za Vikler i ruž (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Vikler i ruž",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "vikler-i-ruz-zagreb/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/vikler-i-ruz-zagreb/",
  uploadDir: "img/uploads",
  phone: "+38515282085",
  email: "vikleriruz@gmail.com",
  buttonClass: "btn btn-glow",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:18px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:absolute}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "cjenik.html", name: "Cjenik" },
    { file: "ekstenzije.html", name: "Ekstenzije i edukacija" }
  ],
  dynamic: {},
  locked: ["[data-open]", "[data-count]"],
  v: 1
};
