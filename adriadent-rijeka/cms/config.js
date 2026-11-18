/* Postavke uređivača za Adriadent (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Adriadent",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "adriadent-rijeka/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/adriadent-rijeka/",
  uploadDir: "img/uploads",
  phone: "+38551676444",
  email: "info@adriadent.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><div class="sec-hd"><span class="idx mono">Novi odjeljak</span><h2>Novi naslov</h2><p class="lead">Kliknite ovdje i upišite tekst.</p></div></div>',
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "usluge.html", name: "Usluge" },
    { file: "cjenik.html", name: "Cjenik" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".hours [data-day]", ".prog"],
  v: 1
};
