import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import {
	type AppContext,
	Link,
	type KvEntry,
	type ListOfLinks,
} from "../types";

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

const addEntryInCache = async (c: AppContext, newEntry: KvEntry) => {
	const data = await c.env.KV_SHORTLINKS.get<ListOfLinks>("list", "json");
	const currentList = data?.list || [];
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

		if (!linkToCreate.slug) {
			linkToCreate.slug = generateRandomSlug();
		}

		if (linkToCreate.slug === "links" || linkToCreate.slug === "list") {
			return c.json(
				{
					success: false,
					error:
						"Custom slug cannot contain reserved alias. Reserved alias': `links`, `list`",
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
			url: linkToCreate.url,
			isPermanent: linkToCreate.isPermanent,
		};
		// await c.env.KV_SHORTLINKS.put(linkToCreate.slug, JSON.stringify(value));
		c.executionCtx.waitUntil(
			c.env.KV_SHORTLINKS.put(linkToCreate.slug, JSON.stringify(value)),
		);

		// Update cache
		const entry = {
			key: linkToCreate.slug,
			value: value,
		};
		c.executionCtx.waitUntil(addEntryInCache(c, entry));

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
