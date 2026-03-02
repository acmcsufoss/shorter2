import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { AppContext } from "../types";
import { getShortlinkBySlug } from "../repository";

export class ShortlinkRedirect extends OpenAPIRoute {
	schema = {
		tags: ["Public"],
		summary: "Redirect client to a saved URL",
		request: {
			params: z.object({
				slug: z.string(),
			}),
		},
		responses: {
			"301": {
				description: "Redirects client to mapped url with permanent redirect",
			},
			"302": {
				description: "Redirects client to mapped url with temporary redirect",
			},
			"404": {
				description: "Link not found",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: z.boolean(),
								error: z.string(),
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

		const res = await getShortlinkBySlug(c, slug);
		if (!res) {
			return c.json(
				{
					success: false,
					error: "Slug not found",
				},
				404,
			);
		}
		const { url, isPermanent } = res;

		const redirectCode = isPermanent ? 301 : 302;
		return c.redirect(url, redirectCode);
	}
}
