import fs from "fs";
import {execSync} from "child_process";

function rmdir(path) {
  try { var files = fs.readdirSync(path); }
  catch(e) { return; }
  if (files.length > 0) {
    for (var i = 0; i < files.length; i++) {
      var filePath = path + '/' + files[i];
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      } else {
	      rmdir(filePath);
      }
    }
  }
  fs.rmdirSync(path);
}

function mkdir(path) {
  fs.mkdirSync(path);
}

function cldir(path) {
  rmdir(path);
  mkdir(path);
}

function exec(cmd, args) {
  return execSync(cmd, args);
}

function clean() {
  console.log("Cleaning...");
  cldir("./dist");
}

function compile() {
  console.log("Compiling...");
  const sha = exec("git rev-parse HEAD | cut -c 1-7").toString().replace("\n", "");
  exec("webpack --config ./tools/config/webpack.config.js");
  exec("cat ./tools/license.js | sed 's/{{sha}}/" + sha + "/' >> ./dist/translatex.js");
}

function bundle() {
  console.log("Bundling...");
}

// src/rules.js is NOT fetched or generated here any more.
//
// This step used to curl http://graffiticode.com/data?id=0vgCM11vlfA and write
// data.options into src/rules.js. That host is gone and the URL 404s. Because
// curl ran without -f it exited 0 on the 404, so JSON.parse threw on the HTML
// error page and the build aborted here, before compiling anything — which is
// why `npm run build` has not worked for some time, and why src/rules.js
// survived: the write never happened.
//
// The rule set is now authored in L0014 (a port of L120, the language it was
// written in originally) as packages/core/spec/latex-to-latex.gc, and written
// here by that repo's tools/emit-translatex-rules.mjs. The generator lives
// there because L0014 depends on this package, so the dependency cannot run the
// other way. To regenerate or to verify src/rules.js is in step:
//
//   cd ../l0014 && node packages/core/tools/emit-translatex-rules.mjs [--check]
function build() {
  let t0 = Date.now();
  clean();
  compile();
  bundle();
  console.log("Build completed in " + (Date.now() - t0) + " ms");
}

build();
