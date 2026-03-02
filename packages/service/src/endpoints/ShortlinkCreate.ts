import { D1CreateEndpoint } from "chanfana";
import { shortlinkMeta } from "../repository";
import { ShortlinkCreateRequest } from "../types";

export class ShortlinkCreate extends D1CreateEndpoint {
	_meta = shortlinkMeta;
	dbname = "DB";
	schema = {
		tags: ["Protected"],
		summary: "Create a new shortlink",
		request: {
			body: {
				content: {
					"application/json": {
						schema: ShortlinkCreateRequest,
					},
				},
			},
		},
	};
}
