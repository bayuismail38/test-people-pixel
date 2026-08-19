import express from "express";
import type { Application, Request, Response } from "express";
import cors from 'cors'
import { createServer } from "http";
import RouteBulk from "./internal/mentions/bulk.js";
import RouteMentions from "./mentions/search.js";
import routeStats from "./mentions/stats.js";

const app: Application = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
    origin: '*',
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

app.get("/", async (req: Request, res: Response) => {
  res.send("Hello TypeScript + Express!");
});

app.use(RouteBulk);
app.use(RouteMentions);
app.use(routeStats);

// app.use(routeAuth)
// app.use(routeUserNonAuth)

// Authenticated routes
// app.use(routeChat, MiddlewareAuth)
// app.use(routeUser)

// Listen
httpServer.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
