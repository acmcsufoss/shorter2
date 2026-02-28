import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext, type KvEntry, Link } from "../types";

const generateRandomSlug = (length: number = 5) => {
	const chars =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let slug = "";
	const randomValues = crypto.getRandomValues(new Uint8Array(length));

	for (let i = 0; i < length; i++) {
		slug += chars[randomValues[i] % chars.length];
	}

	return slug;
};

export const addEntryInCache = async (c: AppContext, newEntry: KvEntry) => {
	const data = await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json");
	const currentList = data || [];
	const updatedList = [...currentList, newEntry];

	await c.env.KV_SHORTLINKS.put("list", JSON.stringify(updatedList));
};

export class LinkCreate extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
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
			"202": {
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
		const data = await this.getValidatedData<typeof this.schema>();
		const linkToCreate = data.body;

		if (!linkToCreate.slug) {
			linkToCreate.slug = generateRandomSlug();
		}
		const reservedSlugs = ["links", "list"]; // update as needed
		if (reservedSlugs.includes(linkToCreate.slug)) {
			return c.json(
				{
					success: false,
					error: `custom slug is a reserved alias (one of ${reservedSlugs.join(", ")})`,
				},
				409,
			);
		}

		// Existence check before insertion
		const exists = await c.env.KV_SHORTLINKS.get(linkToCreate.slug);
		if (exists) {
			return c.json(
				{
					success: false,
					error: "Slug already exists",
				},
				409,
			);
		}
		const value = {
			destination: linkToCreate.url,
			isPermanent: linkToCreate.isPermanent,
		};
		await c.env.KV_SHORTLINKS.put(linkToCreate.slug, JSON.stringify(value));

		// Can't just fire and forget this since workers is serverless
		c.executionCtx.waitUntil(
			addEntryInCache(c, { key: linkToCreate.slug, value: value }),
		);

		return c.json(
			{
				success: true,
				link: {
					slug: linkToCreate.slug,
					url: linkToCreate.url,
					isPermanent: linkToCreate.isPermanent,
				},
			},
			202, // Accepted, processing may not be complete
		);
	}
}
