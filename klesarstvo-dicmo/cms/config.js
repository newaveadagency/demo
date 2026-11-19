/* Postavke uređivača za Klesarstvo Dicmo (demo) */
window.CMS_CONFIG = {
  lang: "hr",
  siteName: "Klesarstvo Dicmo",
  owner: "newaveadagency",
  repo: "demo",
  basePath: "klesarstvo-dicmo/",
  branch: "main",
  siteUrl: "https://newaveadagency.github.io/demo/klesarstvo-dicmo/",
  uploadDir: "img/uploads",
  phone: "+38521837116",
  email: "klesarstvo-dicmo@st.t-com.hr",
  buttonClass: "btn",
  activeClass: "on",
  sectionTemplate: '<div class="wrap"><span class="kick">Nova sekcija</span><h2 style="margin-top:16px;font-size:clamp(32px,4vw,56px)">Novi naslov</h2><p class="lead" style="margin-top:16px">Kliknite ovdje i upišite tekst.</p></div>',
  canvasCss: ".nav{position:relative}",
  pages: [
    { file: "index.html", name: "Naslovnica" },
    { file: "grobnice.html", name: "Grobnice" },
    { file: "materijali.html", name: "Materijali" }
  ],
  dynamic: {},
  locked: ["[data-count]", ".peek"],
  v: 1
};
