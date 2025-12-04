import fs from "fs";
import path from "path";

export function deleteFileIfExists(filePath: string) {
  const fullPath = path.join(process.cwd(), filePath); // Ruta absoluta

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}