import fs from "fs";
import {execSync} from "child_process";

const id = "jR7hLo4MWsy";  // Current best rule set for latex-to-latex translation.

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
//  console.log("exec() cmd=" + cmd);
  return execSync(cmd, args);
}

function clean() {
  console.log("Cleaning...");
  cldir("./build");
  cldir("./lib");
}

function rules() {
  console.log("Fetching rules " + id);
  exec('curl -L "http://www.graffiticode.com/data?id=' + id + '" -o "./build/data.txt"');
  var data = JSON.parse(fs.readFileSync("./build/data.txt", "utf8"));
  fs.writeFileSync("src/rules.js", "export var rules=" + JSON.stringify(data.options), "utf8");
}

function compile() {
  console.log("Compiling...");
  let sha = exec("git rev-parse HEAD | cut -c 1-7").toString().replace("\n", "");
  exec("tsc");
  exec("cp ./build/src/* ./lib");
  exec("cat ./tools/license.js | sed 's/{{sha}}/" + sha + "/' >> ./lib/core.js");
}

function bundle() {
  console.log("Bundling...");
  exec("webpack");
}

function build() {
  let t0 = Date.now();
  clean();
  rules();
  compile();
  bundle();
  console.log("Build completed in " + (Date.now() - t0) + " ms");
}

build();
