import multer from "multer";
import path from "path";
import fs from "fs";

// Configuración de almacenamiento de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";

    if (file.mimetype.startsWith("image/")) {
      folder += "images/";
    } else if (file.mimetype.startsWith("video/")) {
      folder += "videos/";
    }

    // Crear carpeta si no existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });