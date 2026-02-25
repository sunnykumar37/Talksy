const fs = require("fs");
const path = require("path");

try {
  const lightningcssPath = path.dirname(require.resolve("lightningcss"));
  const binaryName = "lightningcss.linux-x64-gnu.node";

  // Try to find the platform-specific binary package
  let sourceBinary;
  try {
    sourceBinary = require.resolve(
      "lightningcss-linux-x64-gnu/" + binaryName
    );
  } catch {
    // Fallback: if the linux-x64-gnu package isn't present, do nothing
    console.log(
      "lightningcss-linux-x64-gnu package not found; skipping binary patch."
    );
    process.exit(0);
  }

  const destBinary = path.join(lightningcssPath, binaryName);
  fs.copyFileSync(sourceBinary, destBinary);
  console.log("Patched lightningcss native binary at", destBinary);
} catch (err) {
  console.log("Skipping lightningcss patch:", err.message);
}

