import { D1ListEndpoint } from "chanfana";
import { shortlinkMeta } from "../repository";

export class ShortlinkList extends D1ListEndpoint {
	_meta = shortlinkMeta;
	dbname = 'DB';
	schema = {
		tags: ["Public"],
		summary: "List Shortlinks",
	};
}
