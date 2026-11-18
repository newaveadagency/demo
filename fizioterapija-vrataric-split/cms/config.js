/* Postavke uređivača za Fizioterapiju Vratarić (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Fizioterapija Vratarić",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "fizioterapija-vrataric-split/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/fizioterapija-vrataric-split/",
  uploadDir: "img/uploads",
  phone: "+385989976098",
  email: "fizioterapija.vrataric@gmail.com",
  buttonClass: "btn btn-blue",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="lbl">Nova sekcija</span><h2 style="margin-top:18px;font-size:clamp(32px,4vw,56px)">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}.gridlines{display:none}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".marq-track"],
  v: 1
};
