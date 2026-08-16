import { z } from "zod";

export const ShortlinkCreateRequest = z.object({
	slug: z.string(),
	url: z.httpUrl(),
});
export type ShortlinkCreateRequest = z.infer<typeof ShortlinkCreateRequest>;
export type ShortlinkCreateRequestInput = z.input<
	typeof ShortlinkCreateRequest
>;

export const ShortlinkModel = z.object({
	slug: z.string(),
	url: z.httpUrl(),
	createdAt: z.iso.datetime().optional(),
});
export type ShortlinkModel = z.infer<typeof ShortlinkModel>;
