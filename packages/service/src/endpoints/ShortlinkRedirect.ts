import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getShortlinkBySlug } from "../repository";
import { type AppContext, ServiceErrorResponse } from "../types";

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
			"302": {
				description: "Redirects client to mapped URL",
			},
			"404": {
				description: "Link not found",
				content: {
					"application/json": {
						schema: ServiceErrorResponse,
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
					errors: [
						{
							code: 7002,
							message: "Slug not found",
						},
					],
				},
				404,
			);
		}
		return c.redirect(res.url, 302);
	}
}
