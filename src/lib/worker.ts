import { parentPort, workerData } from "worker_threads";
interface WorkerDataInput {
  bufferArray: Uint8Array;
}

try {
    const { bufferArray } = workerData as WorkerDataInput;

    const buffer = Buffer.from(bufferArray);

    const jsonString = buffer.toString('utf-8');
    const parsedData = JSON.parse(jsonString);

    parentPort?.postMessage({ success: true, data: parsedData });  
} catch (error) {
    console.error("Error occurred while processing worker data:", error);
}