import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext, Link, KvValue, KvEntry } from "../types";
import { deleteEntryInCache } from "./linkDelete";
import { addEntryInCache } from "./linkCreate";

const updateEntryInCache = async (c, entry: KvEntry) => {
	await deleteEntryInCache(c, entry.key)
	await addEntryInCache(c, entry)
}

export class LinkUpdate extends OpenAPIRoute {
	schema = {
		tags: ["Links"],
		summary: "Update an existing shortlink",
		request: {
			params: z.object({
				slug: Str({ description: "Link slug" }),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							url: z.string().url(),
							isPermanent: Bool(),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the updated shortlink",
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
		const { slug } = data.params;
		const { url, isPermanent } = data.body;

		const existing = await c.env.KV_SHORTLINKS.get<KvValue>(slug, "json");
		if (!existing) {
			return c.json({ success: false, error: "Slug not found" }, 404);
		}

		const updatedValue = {
			url: url || existing.url,
			isPermanent: isPermanent || existing.isPermanent,
		};
		await c.env.KV_SHORTLINKS.put(slug, JSON.stringify(updatedValue));
		c.executionCtx.waitUntil(updateEntryInCache(c, { key: slug, value: updatedValue }));

		return c.json({
			success: true,
			link: {
				slug: slug,
				url: url,
			},
		},
			202
		);
	}
}
