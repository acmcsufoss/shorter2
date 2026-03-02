import { D1ReadEndpoint } from "chanfana";
import { shortlinkMeta } from '../repository';

export class ShortlinkGet extends D1ReadEndpoint {
  _meta = shortlinkMeta;
  dbname = 'DB';
  schema = {
    tags: ["Protected"],
    summary: "Get metadata on one shortlink",
  }
}
