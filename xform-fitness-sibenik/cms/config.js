/* Postavke uređivača za XForm fitness centar (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "XForm fitness centar",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "xform-fitness-sibenik/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/xform-fitness-sibenik/",
  uploadDir: "img/uploads",
  phone: "+385911908790",
  email: "xform.fitnesscentar@gmail.com",
  buttonClass: "btn btn-g",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="lbl">Nova sekcija</span><h2 style="margin-top:18px">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".hdr{position:relative;background:#0a0a0d}.hgal-track{overflow-x:auto}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "programi.html", name: "Programi" },
    { file: "cjenik.html", name: "Cjenik i raspored" }
  ],
  dynamic: {},
  locked: ["[data-count]", "[data-open]", ".marq-track"],
  v: 1
};
