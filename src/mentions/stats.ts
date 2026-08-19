import type { Request, Response } from "express";
import { Router } from "express";
import { db } from "../db/db.ts";
import ResponseHandler from "../handler/errorResponse.ts";
import type { MasterImport } from "../types/MasterImport.ts";
import { Chart } from "../types/Chart.ts";


const routeStats = Router();

routeStats.get("/mentions/stats", async (req: Request, res: Response) => {
    let query;
    let queryIsGroup = false;
    const client = await db.pool.connect();

    try {
        if (typeof req.query.group_by === "string") {
            queryIsGroup = true;
        }

        if(queryIsGroup && req.query.group_by === 'day'){
            query = `SELECT DAYNAME(published_at) as day, source, COUNT(*) FROM master_import WHERE 1=1 GROUP BY DAYNAME(published_at)`;
        }else if(req.query.group_by === 'source'){
            query = `SELECT source, COUNT(*) FROM master_import WHERE 1=1 GROUP BY source`;
        }else{
            query = `SELECT DAYNAME(published_at) as day, source, COUNT(*) FROM master_import WHERE 1=1 GROUP BY DAYNAME(published_at)`;
        }
        
        const { rows } = await client.query(query);

        const response = new ResponseHandler<Chart>(rows).response()

        return res.status(response.StatusCode).json(response)

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default routeStats;
