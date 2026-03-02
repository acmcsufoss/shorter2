import { fromHono } from "chanfana";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import {
	ShortlinkRedirect,
	ShortlinkCreate,
	ShortlinkGet,
	ShortlinkList,
	ShortlinkUpdate,
	ShortlinkDelete,
} from "./endpoints";
import { AppError } from "./errors";
import { ContentfulStatusCode } from "hono/utils/http-status";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();
app.onError((err, c) => {
	if (err instanceof AppError) {
		return c.json(
			{
				success: false,
				errors: [{ message: err.message, code: err.code }],
			},
			err.status as ContentfulStatusCode,
		);
	}
	console.error(err);
	return c.json({ error: "Internal server error", code: "INTERNAL" });
});

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
openapi.post("/_links", ShortlinkCreate);
openapi.put("/_links/:slug{.+}", ShortlinkUpdate);
openapi.get("/", ShortlinkList); // public
openapi.get("/:slug{.+}", ShortlinkRedirect); // public
openapi.get("/_links/:slug{.+}", ShortlinkGet);
openapi.delete("/_links/:slug{.+}", ShortlinkDelete);

export default app;
export * from "./types";
