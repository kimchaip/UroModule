// node MiniApp/OrQueue/build.js [mockupOut]
// Builds index.html (one self-contained page for the Memento mini app) from src/ + orqueue-logic.js.
const fs = require("fs"), path = require("path");
const dir = __dirname, r = f => fs.readFileSync(path.join(dir, f), "utf8");
const logic = r("orqueue-logic.js").replace(/\nif \(typeof module[^\n]*\n?/, "\n");
const css = `<style>\n${r("src/style.css")}</style>\n${r("src/body.html")}`;
const js = `<script>\n${logic}\n${r("src/app.js")}</script>\n`;
const inner = css + '<script src="repository.js"></script>\n' + js;  // repository.js: Memento data access, made by the Builder
const head = `<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>คิวผ่าตัด Uro</title>\n`;
fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html>\n<html lang="th">\n<head>\n${head}</head>\n<body>\n${inner}</body>\n</html>\n`);
if (process.argv[2]) fs.writeFileSync(process.argv[2], `<title>คิวผ่าตัด Uro (แบบร่าง)</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n${css + js}`);
console.log("built index.html");
