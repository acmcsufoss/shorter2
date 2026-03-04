import { z } from "zod";

export const ShortlinkCreateRequest = z.object({
	slug: z.string(),
	url: z.httpUrl(),
	isPermanent: z.boolean().optional().default(false),
});
export type ShortlinkCreateRequest = z.infer<typeof ShortlinkCreateRequest>
export type ShortlinkCreateRequestInput  = z.input<typeof ShortlinkCreateRequest>

export const ShortlinkUpdateRequest = z.object({
	url: z.httpUrl().optional(),
	isPermanent: z.boolean().optional(),
});
export type ShortlinkUpdateRequest = z.infer<typeof ShortlinkUpdateRequest>
export type ShortlinkUpdateRequestInput  = z.input<typeof ShortlinkUpdateRequest>

export const ShortlinkModel = z.object({
	slug: z.string(),
	url: z.httpUrl(),
	isPermanent: z.boolean().optional().default(false),
	createdAt: z.iso.datetime().optional(),
	updatedAt: z.iso.datetime().optional(),
});
export type ShortlinkModel = z.infer<typeof ShortlinkModel>
