import {
	type AppContext,
	type ShortlinkDomain,
	ShortlinkModel,
} from "../types";

export const shortlinkMeta = {
	model: {
		schema: ShortlinkModel,
		primaryKeys: ["slug"],
		tableName: "shortlinks",
	},
};

export const getShortlinkBySlug = async (
	c: AppContext,
	slug: string,
): Promise<ShortlinkDomain> => {
	const res = await c.env.DB.prepare(
		"SELECT s.url FROM shortlinks s WHERE s.slug = ?",
	)
		.bind(slug)
		.first<{ url: string; isPermanent: number }>();

	if (!res) {
		return null;
	}
	return { url: res.url, isPermanent: Boolean(res.isPermanent) };
};
