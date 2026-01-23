import { fromHono } from "chanfana";
import { Hono } from "hono";
import { LinkCreate } from "./endpoints/linkCreate";
// import { LinkUpdate } from "./endpoints/linkUpdate";
import { LinkDelete } from "./endpoints/linkDelete";
import { LinkFetch } from "./endpoints/linkFetch";
import { LinkList } from "./endpoints/linkList";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.post("/links", LinkCreate);
// openapi.put("/links/:slug", LinkUpdate);
openapi.get("/links", LinkList);
openapi.get("/links/:slug", LinkFetch);
openapi.delete("/links/:slug", LinkDelete);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
