import { D1UpdateEndpoint } from "chanfana";
import { z } from "zod";
import { shortlinkMeta } from "../repository";
import { ShortlinkUpdateRequest } from "../types";

export class ShortlinkUpdate extends D1UpdateEndpoint {
	_meta = shortlinkMeta;
	dbname = "DB";
	schema = {
		tags: ["Protected"],
		summary: "Update existing shortlink",
		request: {
			params: z.object({
				slug: z.string(),
			}),
			body: {
				content: {
					"application/json": {
						schema: ShortlinkUpdateRequest,
					},
				},
			},
		},
	};
}
