import { parentPort, workerData } from "worker_threads";
import { db } from "../db/db.js";
import { masterImportDataTransform } from "../types/MasterImport.js";
interface WorkerDataInput {
  bufferArray: Uint8Array;
  fileName: string;
}

try {
    const client = await db.pool.connect();
    const { bufferArray, fileName } = workerData as WorkerDataInput;


    try {
        await client.query('BEGIN');
        const dataInsert = await client.query("INSERT INTO file_import (file_name, status_id) VALUES ($1, $2)", [fileName, 1]);
        console.log(dataInsert.rows)
        await client.query('COMMIT');
    } catch (err: any) {
        await client.query('ROLLBACK');
    }

    const buffer = Buffer.from(bufferArray);

    const jsonString = buffer.toString('utf-8');
    const parsedData = JSON.parse(jsonString);
    const id = [];
    for (const item of parsedData) {
        id.push(item.external_id);
    }
    const queryMaster = "SELECT external_id FROM master_import WHERE external_id IN (" + id.map((_, i) => `$${i + 1}`).join(', ') + ")";
    const get = await client.query(queryMaster, id);
    let itemOnMemory;
    try {
        for (const item of parsedData) {
            itemOnMemory = item;
            await client.query('BEGIN');
            
            if(get.rows.length === 0) {
                const find = await client.query("SELECT external_id FROM master_import WHERE external_id = $1", [item.external_id]);
                if(find.rows.length > 0) {
                    continue;
                }
                const query = "INSERT INTO master_import (external_id, author, source, title, content, url, published_at, engagement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                const objValues = masterImportDataTransform(item);
                await client.query(query, [
                    objValues.external_id,
                    objValues.author,
                    objValues.source,
                    objValues.title,
                    objValues.content,
                    objValues.url,
                    objValues.published_at,
                    objValues.engagement
                ]);
            }else {
                const find = get.rows.find((row: any) => row.external_id === item.external_id);
                if(!find) {
                    const query = "INSERT INTO master_import (external_id, author, source, title, content, url, published_at, engagement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                    const objValues = masterImportDataTransform(item);
                    await client.query(query, [
                        objValues.external_id,
                        objValues.author,
                        objValues.source,
                        objValues.title,
                        objValues.content,
                        objValues.url,
                        objValues.published_at,
                        objValues.engagement
                    ]);
                }
            }
        }

        await client.query('COMMIT');   
    }catch(err: any) {
        console.error(`Gagal pada ${itemOnMemory}. Semua insert dibatalkan!`);
        throw err;
    }
    

    parentPort?.postMessage({ success: true, data:  "Data processed successfully" });  
} catch (error) {
    console.error("Error occurred while processing worker data:", error);
}