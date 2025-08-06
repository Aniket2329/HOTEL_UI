import type { Context } from "@netlify/functions";
import serverless from "serverless-http";
import { createServer } from "../../server";
import { DatabaseService } from "../../server/lib/database";

let app: any;

const initializeApp = async () => {
  if (!app) {
    // Initialize database first
    await DatabaseService.connect();
    await DatabaseService.seed();
    app = createServer();
  }
  return app;
};

export default async (req: Request, context: Context) => {
  const handler = serverless(await initializeApp());
  return handler(req, context);
};
