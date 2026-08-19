import type { Request, Response } from "express";
import { Router } from "express";
import { db } from "../db/db.js";
import ResponseHandler from "../handler/errorResponse.js";
import type { MasterImport } from "../types/MasterImport.js";


const RouteMentions = Router();

RouteMentions.get("/mentions", async (req: Request, res: Response) => {
    let query;
    let querySearch;
    let queryPage;
    let queryDate;
    const client = await db.pool.connect();

    try {
        query = `SELECT 
            master_import.*, 
            author_name, 
            source 
        FROM master_import 
        JOIN author ON author.id = master_import.author_id 
        JOIN source_list ON source_list.id = master_import.source_id
        WHERE 1=1`;
        if (typeof req.query.q === "string") {
            querySearch = ` AND author_name LIKE '%${req.query.q}%' OR content LIKE '%${req.query.q}%' OR title LIKE '%${req.query.q}%' OR source LIKE '%${req.query.q}%'`;
        }
        if (typeof req.query.page === "string") {
            const page = parseInt(req.query.page);
            const limit = 5;
            const offset = (page - 1) * limit;
            queryPage = ` AND master_import.id BETWEEN ${offset + 1} AND ${offset + limit} `;
        }
        
        if (typeof req.query.from === "string" && typeof req.query.to === "string") {
            const fromDate = new Date(req.query.from);
            const toDate = new Date(req.query.to);
            queryDate = ` AND published_at BETWEEN '${fromDate.toISOString()}' AND '${toDate.toISOString()}'`;
        }
        const { rows } = await client.query(query + (querySearch || "") + (queryPage || "") + (queryDate || ""));

        const response = new ResponseHandler<MasterImport[]>(rows).responses()

        return res.status(response.StatusCode).json(response)

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default RouteMentions;
