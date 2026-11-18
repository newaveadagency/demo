/* Postavke uređivača za ISSA Diving Center (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "ISSA Diving Center",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "issa-diving-komiza/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/issa-diving-komiza/",
  uploadDir: "img/uploads",
  phone: "+385912012731",
  email: "info@scubadiving.hr",
  buttonClass: "btn btn-grad",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="eyebrow">Nova sekcija</span><h2 class="big">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "lokacije.html", name: "Olupine i lokacije" },
    { file: "cjenik.html", name: "Cjenik i tečajevi" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-rotate]", "[data-depth]", "[data-hx-bar]"],
  v: 1
};
