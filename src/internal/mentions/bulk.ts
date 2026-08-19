import { Request, Response, Router } from "express";
import multer from "multer";
import { upload } from "../../handler/storage";

const RouteBulk = Router();

RouteBulk.post("/internal/mentions/bulk", upload.single("file"), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        if(req.file.originalname.split(".").pop() !== "json") {
            return res.status(400).send("Invalid file type. Please upload a JSON file.");
        }

        
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default RouteBulk;
