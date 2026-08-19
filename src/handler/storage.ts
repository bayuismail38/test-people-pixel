import { Request } from "express";
import multer from "multer"

const storage = multer.memoryStorage();
const jsonFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
  if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
    cb(null, true);
  } else {
    cb(new Error('Only JSON files are allowed!'), false);
  }
};

export const upload = multer({ storage: storage, fileFilter: jsonFilter });