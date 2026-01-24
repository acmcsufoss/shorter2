import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Link } from "../types";

export class LinkUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
		summary: "Update an existing shortlink",
		request: {
			params: z.object({
				slug: Str({ description: "Link slug" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							url: z.string().url(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the updated shortlink",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result: z.object({
									link: Link,
								}),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { slug } = data.params;
		const { url } = data.body;

		const existing = await c.env.KV_SHORTLINKS.get(slug);
		if (existing === null) {
			return c.json({ success: false, error: "Slug not found" }, 404);
		}

		await c.env.KV_SHORTLINKS.put(slug, url);

		return c.json({
			success: true,
			link: {
				slug: slug,
				url: url,
			},
		});
	}
}
