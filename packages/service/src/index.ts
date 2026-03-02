import { fromHono } from "chanfana";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import {
	ShortlinkCreate,
	ShortlinkDelete,
	ShortlinkGet,
	ShortlinkList,
	ShortlinkRedirect,
	ShortlinkUpdate,
} from "./endpoints";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

app.use("/_links/*", async (c, next) => {
	if (c.env.ENVIRONMENT === "development") return next();
	const auth = bearerAuth({
		token: c.env.SHORTER_API_KEY,
	});
	return auth(c, next);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/docs",
});

// Register OpenAPI endpoints
openapi.put("/_links/:slug{.+}", ShortlinkUpdate);
openapi.get("/_links/:slug{.+}", ShortlinkGet);
openapi.delete("/_links/:slug{.+}", ShortlinkDelete);
openapi.post("/_links", ShortlinkCreate);
openapi.get("/:slug{.+}", ShortlinkRedirect); // public
openapi.get("/", ShortlinkList); // public

export default app;
export * from "./types";
