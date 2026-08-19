import type { Request, Response } from "express";
import { Router } from "express";
import { upload } from "../../handler/storage.js";
import path from "path";
import { Worker } from "worker_threads";
import { pathToFileURL } from "url";


const RouteBulk = Router();

RouteBulk.post("/internal/mentions/bulk", upload.single("file"), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        if(req.file.originalname.split(".").pop() !== "json") {
            return res.status(400).send("Invalid file type. Please upload a JSON file.");
        }
        // Resolve worker path relative to project root to avoid using import.meta
        let workerPath = path.resolve(process.cwd(), `src/lib/worker.ts`);

        const isDev = import.meta.url.includes("/src/");
        workerPath = isDev
        ? path.resolve(process.cwd(), "src/lib/worker.ts")
        : path.resolve(process.cwd(), "dist/lib/worker.js");

        const run = () => {
        return new Promise((resolve, reject) => {
            let worker: Worker;

            if (isDev) {
            // --- MODE DEVELOPMENT (Mendukung TSX + ESM) ---
            const secureWorkerUrl = pathToFileURL(workerPath).href;
            
            // String skrip murni untuk mendaftarkan loader tsx di dalam thread anak
            const workerScript = `
                import { workerData } from 'node:worker_threads';
                import('tsx/esm/api').then(({ register }) => {
                register();
                import(workerData.workerUrl);
                });
            `;

            worker = new Worker(workerScript, {
                eval: true, // Wajib true karena mengeksekusi string skrip di atas
                workerData: {
                workerUrl: secureWorkerUrl,
                bufferArray: new Uint8Array(req.file!.buffer),
                fileName: req.file!.originalname
                }
            });
            } else {
            // --- MODE PRODUCTION / BUILD (Menjalankan file .js hasil compile) ---
            worker = new Worker(workerPath, {
                eval: false, // Wajib false karena menjalankan file fisik langsung
                workerData: {
                bufferArray: new Uint8Array(req.file!.buffer),
                fileName: req.file!.originalname
                }
            });
            }

            // Event listener untuk Worker
            worker.on("message", (res) => {
            resolve(res); // Sesuaikan jika struktur return di worker Anda adalah langsung data atau object
            });

            worker.on("error", (error) => {
            reject(error);
            });

            worker.on("exit", (code) => {
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
