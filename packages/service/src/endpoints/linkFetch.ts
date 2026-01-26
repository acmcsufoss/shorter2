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

		interface ValueType {
			url: string;
			isPermanent: boolean;
		}
		const value = await c.env.KV_SHORTLINKS.get<ValueType>(slug, "json");

		if (!value) {
			return c.json(
				{
					success: false,
					error: "Slug not found",
				},
				404,
			);
		}

		const { url, isPermanent } = value;
		const redirectCode = isPermanent ? 301 : 302;
		return c.redirect(url, redirectCode);
	}
}
