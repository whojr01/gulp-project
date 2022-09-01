const { src, dest } = require("gulp");
const sass = require("gulp-sass")(require("sass"));

function copy(cb) {
  src("routes/*.js").pipe(dest("copies"));
  cb();
}

function generateCSS(cb) {
  src("./sass/**/*.scss").pipe(sass().on("error", sass.logError)).pipe(dest("public/stylesheets"));
  cb();
}

exports.copy = copy;
exports.css = generateCSS;
