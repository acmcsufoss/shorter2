import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import type { AppContext, KvEntry } from "../types";

export const deleteEntryInCache = async (
	c: AppContext,
	slugToDelete: string,
) => {
	const data = await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json");
	if (!data) return;
	const updatedList = data.filter((entry) => entry.key !== slugToDelete);

	await c.env.KV_SHORTLINKS.put("list", JSON.stringify(updatedList));
};

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
		c.executionCtx.waitUntil(deleteEntryInCache(c, slug));

		return c.json(
			{
				success: true,
				slug: slug,
			},
			202,
		);
	}
}
