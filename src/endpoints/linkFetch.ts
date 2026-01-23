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

		// Implement your own object fetch here

		const exists = true;

		// @ts-ignore: check if the object exists
		if (exists === false) {
			return Response.json(
				{
					success: false,
					error: "Object not found",
				},
				{
					status: 404,
				},
			);
		}

		return {
			success: true,
			link: {
				name: "my task",
				slug: slug,
			},
		};
	}
}
