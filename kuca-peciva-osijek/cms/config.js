/* Postavke uređivača za Kuću peciva (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Kuća peciva",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "kuca-peciva-osijek/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/kuca-peciva-osijek/",
  uploadDir: "img/uploads",
  phone: "+385919233090",
  email: "kucapeciva@gmail.com",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:12px">Novi naslov</h2><p class="lead" style="margin-top:14px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "torte.html", name: "Torte i prigode" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]"],
  v: 1
};
