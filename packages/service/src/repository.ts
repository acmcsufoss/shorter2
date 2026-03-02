import { ShortlinkModel } from "./types";

export const shortlinkMeta = {
	model: {
		schema: ShortlinkModel,
		primaryKeys: ['slug'],
		tableName: 'shortlinks',
	}
}
