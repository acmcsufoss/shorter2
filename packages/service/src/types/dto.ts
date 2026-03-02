import { z } from "zod";

export const ShortlinkCreateRequest = z.object({
	slug: z.string(),
	url: z.url(),
	isPermanent: z.boolean().optional().default(false),
});

export const ShortlinkUpdateRequest = z.object({
	url: z.url().optional(),
	isPermanent: z.boolean().optional(),
});

export const ShortlinkModel = z.object({
	slug: z.string(),
	url: z.url(),
	isPermanent: z.boolean().optional().default(false),
	createdAt: z.iso.datetime().optional(),
	updatedAt: z.iso.datetime().optional(),
});
