import "multer";
// Extiende la interfaz Request de Express para incluir la propiedad 'files' utilizada por Multer
declare global {
  namespace Express {
    interface Request {
      files?: Express.Multer.File[] | {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}