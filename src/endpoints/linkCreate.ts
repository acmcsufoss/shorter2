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

	async handle(c: AppContext) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated request body
		const linkToCreate = data.body;

		// Implement your own object insertion here
		await c.env.KV_SHORTLINKS.put(linkToCreate.slug, linkToCreate.url)

		// return the new link
		return {
			success: true,
			link: {
				slug: linkToCreate.slug,
				url: linkToCreate.url,
			},
		};
	}
}
