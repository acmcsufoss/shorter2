import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, Link } from "../types";

export class LinkList extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
		summary: "List Shortlinks",
		request: {
			query: z.object({
				page: Num({
					description: "Page number",
					default: 0,
				}),
				isCompleted: Bool({
					description: "Filter by completed flag",
					required: false,
				}),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of shortlinks",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result: z.object({
									tasks: Link.array(),
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

		// Retrieve the validated parameters
		const { page, isCompleted } = data.query;

		// Implement your own object list here

		return {
			success: true,
			tasks: [
				{
					name: "Clean my room",
					slug: "clean-room",
					description: null,
					completed: false,
					due_date: "2025-01-05",
				},
				{
					name: "Build something awesome with Cloudflare Workers",
					slug: "cloudflare-workers",
					description: "Lorem Ipsum",
					completed: true,
					due_date: "2022-12-24",
				},
			],
		};
	}
}
