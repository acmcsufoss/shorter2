import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Link } from "../types";

export class LinkCreate extends OpenAPIRoute {
	schema = {
		tags: ["Link"],
		summary: "Create a new shortlink",
		request: {
			body: {
				content: {
					"application/json": {
						schema: Link,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the created shortlink",
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

	generateRandomSlug(length: number = 5) {
		const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
		let slug = '';
		const randomValues = crypto.getRandomValues(new Uint8Array(length))

		for (let i = 0; i < length; i++) {
			slug += chars[randomValues[i] % chars.length];
		}

		return slug;
	}

	async handle(c: AppContext) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated request body
		const linkToCreate = data.body;

		if (!linkToCreate.slug) {
			linkToCreate.slug = this.generateRandomSlug()
		}

		// Existence check before insertion
		const value = await c.env.KV_SHORTLINKS.get(linkToCreate.slug)
		if (value) {
			return c.json(
				{
					success: false,
					error: "Slug already exists"
				},
				409
			)
		}
		await c.env.KV_SHORTLINKS.put(linkToCreate.slug, linkToCreate.url)

		return c.json(
			{
				success: true,
				link: {
					slug: linkToCreate.slug,
					url: linkToCreate.url,
				}
			},
		);
	}
}
