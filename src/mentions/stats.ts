import type { Request, Response } from "express";
import { Router } from "express";
import { db } from "../db/db.ts";
import ResponseHandler from "../handler/errorResponse.ts";


const routeStats = Router();

routeStats.get("/mentions/stats", async (req: Request, res: Response) => {
    let query = `SELECT
                    author as Author,
                    TO_CHAR(published_at, 'FMDay') as Day,
                    COUNT(*) as total_post,
                    (SUM(engagement)*1.0/(SELECT SUM(engagement) FROM master_import)) as percentage_engagement,
                    SUM(engagement) as total_engagement
                FROM
                    master_import
                WHERE
                    1 = 1
                GROUP BY author, published_at`;
    let queryIsGroup = false;
    const client = await db.pool.connect();

    try {
        if (typeof req.query.group_by === "string") {
            queryIsGroup = true;
        }

        if(req.query.group_by === 'source'){
            query = `SELECT
                        author as Author,
                        SOURCE as Source,
                        COUNT(*) as total_post,
                        (SUM(engagement)*1.0/(SELECT SUM(engagement) FROM master_import)) as percentage_engagement,
                        SUM(engagement) as total_engagement
                    FROM
                        master_import
                        WHERE
                        1 = 1
                    GROUP BY author, source`;
        }
        
        const { rows } = await client.query(query);

        const response = new ResponseHandler<any>(rows).response()

        return res.status(response.StatusCode).json(response)

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

export default routeStats;
