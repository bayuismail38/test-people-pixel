import type { Request, Response } from "express";
import { Router } from "express";
import multer from "multer";
import { upload } from "../../handler/storage.ts";
import path from "path";
import { Worker } from "worker_threads";
import { fileURLToPath } from "url";


const RouteBulk = Router();

RouteBulk.post("/internal/mentions/bulk", upload.single("file"), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        if(req.file.originalname.split(".").pop() !== "json") {
            return res.status(400).send("Invalid file type. Please upload a JSON file.");
        }
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const workerPath = path.resolve(__dirname, `./../../lib/worker.ts`);

        const run = () => {
            return new Promise((resolve, reject) => {
                const worker = new Worker(workerPath, {
                    // 2. Wrap buffer directly into a structured cloneable Uint8Array array
                    workerData: {
                        bufferArray: new Uint8Array(req.file.buffer),
                        fileName: req.file.originalname
                    },
                    // 3. MANDATORY FOR TSX SUB-THREADS: This loader enables ESM + TS parsing across threads
                    execArgv: ['--import', 'tsx'] 
                })

                worker.on("message", (res) => {
                    resolve(res.data);
                });
                worker.on("error", (error) => {
                    reject(error);
                });
                worker.on('exit', (code) => {
                    if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
                });
            });


        };

        const processedData = await run();

        return res.status(200).json({
            message: "File processed successfully",
            data: processedData
        })

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default RouteBulk;
