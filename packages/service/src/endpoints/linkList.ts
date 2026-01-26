import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
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
		const allLinks = await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json")

		return c.json({
			success: true,
			links: allLinks,
		});
	}
}
