import { Bool, OpenAPIRoute } from "chanfana";
import { html } from "hono/html";
import { z } from "zod";
import { type AppContext, type KvEntry, Link } from "../types";

export class LinkFetchAll extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
		summary: "List Shortlinks",
		responses: {
			"200": {
				description: "Returns a list of shortlinks",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result: z.object({
									tasks: Link.array(),
								}),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const allLinks =
			(await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json")) || []; // null check

		// Return HTML if the client requesting wants html (e.g., browsers) and JSON otherwise
		const accept = c.req.header("Accept");
		if (accept?.includes("text/html")) {
			return c.html(html`
<!DOCTYPE html>
<html>
	<head>
		<title>acm@CSUF's Shortlinks</title>
		<style>
			body {
				display: grid;
				place-items: center;
				min-height: 100vh;
				margin: 0;
			}
			.container {
				padding: 2rem;
				border-radius: 8xp;
			}
		</style>
	</head>
	<body>
		<div class="container">
			<h1>Shortlink Mappings</h1>
			<ul>
				${allLinks.map(
					(link) => html`
					<li>
						<a href="https://s.acmcsuf.com/${link.key}">${link.key}</a>
						➫
						<a href="${link.value.url}">${link.value.url}</a>
					</li>
				`,
				)}
			</ul>
		</div>
	</body>
</html>
`);
		}

		return c.json({
			success: true,
			links: allLinks,
		});
	}
}
