// Helper functions for working with the cache entry in KV
import type { AppContext, KvEntry } from "./types";

export const AddEntryInCache = async (c: AppContext, newEntry: KvEntry) => {
	const data = await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json");
	const currentList = data || [];
	const updatedList = [...currentList, newEntry];

	await c.env.KV_SHORTLINKS.put("list", JSON.stringify(updatedList));
};

export const DeleteEntryInCache = async (
	c: AppContext,
	slugToDelete: string,
) => {
	const data = await c.env.KV_SHORTLINKS.get<KvEntry[]>("list", "json");
	if (!data) return;
	const updatedList = data.filter((entry) => entry.key !== slugToDelete);

	await c.env.KV_SHORTLINKS.put("list", JSON.stringify(updatedList));
};

export const UpdateEntryInCache = async (c: AppContext, entry: KvEntry) => {
	await DeleteEntryInCache(c, entry.key);
	await AddEntryInCache(c, entry);
};
