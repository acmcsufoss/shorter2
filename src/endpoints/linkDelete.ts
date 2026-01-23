import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";

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
								slug: Str(),
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

		await c.env.KV_SHORTLINKS.delete(slug);

		// Return the deleted link for confirmation
		return c.json({
			success: true,
			slug: slug,
		});
	}
}
