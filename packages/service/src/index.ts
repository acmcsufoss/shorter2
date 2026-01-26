import { fromHono } from "chanfana";
import { Hono } from "hono";
import { bearerAuth } from 'hono/bearer-auth';
import { LinkCreate } from "./endpoints/linkCreate";
import { LinkDelete } from "./endpoints/linkDelete";
import { LinkFetch } from "./endpoints/linkFetch";
import { LinkList } from "./endpoints/linkList";
import { LinkUpdate } from "./endpoints/linkUpdate";

// interface Env {
// 	SHORTER_API_KEY: string
// }

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// TODO: Add functionality to skip this in local dev
app.use('/links/*', async (c, next) => {
	const auth = bearerAuth({
		token: c.env.SHORTER_API_KEY,
	});
	return auth(c, next)
})

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/links", LinkCreate);
openapi.put("/links/:slug", LinkUpdate);
openapi.get("/list", LinkList);  // public
openapi.get(":slug", LinkFetch); // public
openapi.delete("/links/:slug", LinkDelete);

export type AppType = typeof app;
// Export the Hono app
export default app;
