import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { DeleteEntryInCache } from "../cache";
import type { AppContext } from "../types";

export class LinkDelete extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
		summary: "Delete a shortlink",
		request: {
			params: z.object({
				slug: Str({ description: "shortlink slug" }),
			}),
		},
		responses: {
			"202": {
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
		const { slug } = data.params;

		await c.env.KV_SHORTLINKS.delete(slug);

		// Cannot fire and forget in serverless environment
		c.executionCtx.waitUntil(DeleteEntryInCache(c, slug));

		return c.json(
			{
				success: true,
				slug: slug,
			},
			202,
		);
	}
}
