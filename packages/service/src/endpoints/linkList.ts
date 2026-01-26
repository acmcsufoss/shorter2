import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Link } from "../types";

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
		const allKeys = await c.env.KV_SHORTLINKS.list();
		// const allLinks = await c.env.KV_SHORTLINKS.get()

		return c.json({
			success: true,
			allKeys: allKeys,
		});
	}
}
