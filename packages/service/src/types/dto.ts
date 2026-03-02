import { z } from "zod";
import { generateRandomSlug } from "../utils";

// export const CreateLinkDto = z.object({
// 	slug: z.string().optional(),
// 	url: z.url(),
// 	isPermanent: z.boolean().optional().default(false),
// });
//
// export type CreateLinkDto = z.infer<typeof CreateLinkDto>; // For validated data
// export type CreateLinkInputDto = z.input<typeof CreateLinkDto>; // Unvalidated data
//
// export const UpdateLinkDto = z.object({
// 	url: z.url().optional(),
// 	isPermanent: z.boolean().optional(),
// });
//
// export type UpdateLinkDto = z.infer<typeof UpdateLinkDto>;
// export type UpdateLinkInputDto = z.input<typeof UpdateLinkDto>;

export const ShortlinkCreateRequest = z.object({
	slug: z.string().optional().default(generateRandomSlug()),
	url: z.url(),
	isPermanent: z.boolean().optional().default(false),
})

export const ShortlinkModel = z.object({
	slug: z.string(),
	url: z.url(),
	isPermanent: z.boolean().optional().default(false),
	createdAt: z.iso.datetime().optional(),
	updatedAt: z.iso.datetime().optional(),
})
