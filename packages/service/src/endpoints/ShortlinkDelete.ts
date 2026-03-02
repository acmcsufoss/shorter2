import { D1DeleteEndpoint } from "chanfana";
import { shortlinkMeta } from "../repository";

export class ShortlinkDelete extends D1DeleteEndpoint {
	_meta = shortlinkMeta;
	dbname = "DB";
	schema = {
		tags: ["Protected"],
		summary: "Delete a shortlink",
	};
}
