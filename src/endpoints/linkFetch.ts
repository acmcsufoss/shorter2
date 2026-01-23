import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Link } from "../types";

export class LinkFetch extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
		summary: "Get a single URL by slug",
		request: {
			params: z.object({
				slug: Str({ description: "Link slug" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns a single URL if found",
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
			"404": {
				description: "Link not found",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								error: Str(),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated slug
		const { slug } = data.params;

		const url = await c.env.KV_SHORTLINKS.get(slug);

		if (url === null) {
			return c.json(
				{
					success: false,
					error: "Slug not found",
				},
				404
			);
		}

		// NOTE: old shorter used 302 redirects over 301 so replicating that here
		// We could change this, 301 is for permanent redirects and enables browser caching
		return c.redirect(url, 302)
	}
}
