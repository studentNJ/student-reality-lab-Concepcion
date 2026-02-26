import { execSync } from "node:child_process";
import path from "node:path";

const root = path.resolve(new URL("../../", import.meta.url).pathname);

try {
  execSync("npm --prefix packages/db run prisma:generate", { cwd: root, stdio: "inherit" });
  execSync("npm --prefix packages/db run prisma:seed", { cwd: root, stdio: "inherit" });
  console.log("Database load complete.");
} catch (error) {
  console.error("Failed loading metrics into database.");
  throw error;
}
