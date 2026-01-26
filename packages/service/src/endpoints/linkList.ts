import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { html } from 'hono/html';
import { type AppContext, Link, KvEntry } from "../types";

export class LinkList extends OpenAPIRoute {
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
		const allLinks = await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json") || []; // null check

		// Return HTML if the client requesting wants html (e.g., browsers) and JSON otherwise
		const accept = c.req.header("Accept");
		if (accept && accept.includes('text/html')) {
			return c.html(html`
<html>
	<head><title>acm@CSUF's Shortlinks</title></head>
	<body>
		<div style="margin: auto;">
			<h1>Shortlink Mappings</h1>
			<ul>
				${allLinks.map(link => `
					<li><a href="https://s.acmcsuf.com/${link.key}">${link.key}</a> => <a href="${link.value.url}">${link.value.url}</a></li>
				`).join('')}
			</ul>
		</div>
	</body>
</html>
`
			)
		}

		return c.json({
			success: true,
			links: allLinks,
		});
	}
}
