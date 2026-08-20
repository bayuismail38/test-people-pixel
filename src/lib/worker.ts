import { parentPort, workerData } from "worker_threads";
import { db } from "./../db/db.js";
import { masterImportDataTransform } from "../types/MasterImport.js";
import { error } from "console";
import { parse } from "path";
import { string } from "zod";
interface WorkerDataInput {
  bufferArray: Uint8Array;
  fileName: string;
}

const client = await db.pool.connect();
const { bufferArray, fileName } = workerData as WorkerDataInput;


const dataInsert = await client.query("INSERT INTO file_import (file_name, status_id) VALUES ($1, $2) RETURNING id", [fileName, 1]);
const lastInsertID = dataInsert.rows[0].id
console.log(lastInsertID)
try {
    const buffer = Buffer.from(bufferArray);

    const jsonString = buffer.toString('utf-8');
    const parsedData = JSON.parse(jsonString);
    const id = [];
    if (parsedData.length == 0) {
        throw error;
    }
    for (const item of parsedData) {
        id.push(item.external_id);
    }
    const queryMaster = "SELECT external_id FROM master_import WHERE external_id IN (" + id.map((_, i) => `$${i + 1}`).join(', ') + ")";
    const get = await client.query(queryMaster, id);
    let itemOnMemory;
    let dataSource;
    let dataAuthor;
    try {
        for (const item of parsedData) {
            itemOnMemory = item;
            await client.query('BEGIN');
            const objValues = masterImportDataTransform(item);
            dataAuthor = await client.query('SELECT id from author where author_name ILIKE $1', [String(objValues.author).toLowerCase()]);
            console.log(dataAuthor)
            if (dataAuthor.rowCount == 0) {
                dataAuthor = await client.query('INSERT INTO author (author_name) VALUES ($1) RETURNING id', [String(objValues.author).toLowerCase()]);
            }

            dataSource = await client.query('SELECT id FROM source_list WHERE source ILIKE $1', [String(objValues.source).toLowerCase()]);
            if (dataSource.rowCount == 0) {
                dataSource = await client.query("INSERT INTO source_list (source) VALUES ($1) RETURNING id", [String(objValues.source).toLowerCase()])
            }
            if(get.rows.length === 0) {
                const find = await client.query("SELECT external_id FROM master_import WHERE external_id = $1", [objValues.external_id]);
                if(find.rows.length > 0) {
                    continue;
                }
                const query = "INSERT INTO master_import (external_id, author_id, source_id, title, content, url, published_at, engagement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                await client.query(query, [
                    objValues.external_id,
                    dataAuthor.rows[0].id,
                    dataSource.rows[0].id,
                    objValues.title,
                    objValues.content,
                    objValues.url,
                    objValues.published_at,
                    objValues.engagement
                ]);
            }else {
                const find = get.rows.find((row: any) => row.external_id === item.external_id);
                if(!find) {
                    const query = "INSERT INTO master_import (external_id, author_id, source_id, title, content, url, published_at, engagement) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
                    await client.query(query, [
                        objValues.external_id,
                        dataAuthor.rows[0].id,
                        dataSource.rows[0].id,
                        objValues.title,
                        objValues.content,
                        objValues.url,
                        objValues.published_at,
                        objValues.engagement
                    ]);
                }
            }
        }
        await client.query('UPDATE file_import SET status_id = 2 WHERE file_import.id = $1', [lastInsertID])
        await client.query('COMMIT');   
    }catch(err: any) {
        await client.query('ROLLBACK')
        await client.query('UPDATE file_import SET status_id = 3 WHERE file_import.id = $1', [lastInsertID])
        console.error(`Gagal pada ${itemOnMemory}. Semua insert dibatalkan!`);
        throw err;
    }
    

    parentPort?.postMessage({ success: true, data:  "Data processed successfully" });  
} catch (error) {
    await client.query('UPDATE file_import SET status_id = 3 WHERE id = $1', [lastInsertID])
    console.error("Error occurred while processing worker data:", error);
}