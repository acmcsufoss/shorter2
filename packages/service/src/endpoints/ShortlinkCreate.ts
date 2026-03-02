import { D1CreateEndpoint } from "chanfana";
import { ShortlinkCreateRequest } from "../types";
import { shortlinkMeta } from '../repository';

export class ShortlinkCreate extends D1CreateEndpoint {
	_meta = shortlinkMeta;
	dbname = 'DB'
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
	}
}

