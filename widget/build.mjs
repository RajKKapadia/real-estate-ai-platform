import { build } from "esbuild";

await build({
  entryPoints: ["widget/src/index.ts"],
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  outfile: "public/widget.js",
});

console.log("Widget built → public/widget.js");
