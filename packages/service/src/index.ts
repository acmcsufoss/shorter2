import { fromHono, D1UpdateEndpoint, D1DeleteEndpoint } from "chanfana";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { ShortlinkModel } from "./types";
import { ShortlinkRedirect, ShortlinkCreate, ShortlinkGet, ShortlinkList } from "./endpoints";
import { AppError } from "./errors";
import { ContentfulStatusCode } from "hono/utils/http-status";

const shortlinkMeta = {
	model: {
		schema: ShortlinkModel,
		primaryKeys: ['slug'],
		tableName: 'shortlinks',
	}
}

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();
app.onError((err, c) => {
	if (err instanceof AppError) {
		return c.json({
			success: false,
			errors: [
				{ message: err.message, code: err.code },
			]
		},
			err.status as ContentfulStatusCode);
	}
	console.error(err);
	return c.json({ error: "Internal server error", code: "INTERNAL" })
});

app.use("/_links/*", async (c, next) => {
	if (c.env.ENVIRONMENT === "development") return next();
	const auth = bearerAuth({
		token: c.env.SHORTER_API_KEY,
	});
	return auth(c, next);
});

class ShortlinkUpdate extends D1UpdateEndpoint { _meta = shortlinkMeta; dbname = 'DB' }
class ShortlinkDelete extends D1DeleteEndpoint { _meta = shortlinkMeta; dbname = 'DB' }

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
