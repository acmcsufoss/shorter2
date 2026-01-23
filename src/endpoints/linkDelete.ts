import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Link } from "../types";

export class LinkDelete extends OpenAPIRoute {
	schema = {
		tags: ["Link"],
		summary: "Delete a shortlink",
		request: {
			params: z.object({
				slug: Str({ description: "shortlink slug" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns if the shortlink was deleted successfully",
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

		// Retrieve the validated slug
		const { slug } = data.params;

		// Implement your own object deletion here

		// Return the deleted link for confirmation
		return {
			result: {
				link: {
					name: "Build something awesome with Cloudflare Workers",
					slug: slug,
					description: "Lorem Ipsum",
					completed: true,
					due_date: "2022-12-24",
				},
			},
			success: true,
		};
	}
}
