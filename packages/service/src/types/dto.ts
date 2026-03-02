import { z } from "zod";

export const CreateLinkDto = z.object({
	slug: z.string().optional(),
	url: z.string().url(),
	isPermanent: z.boolean().optional().default(false),
});

export type CreateLinkDto = z.infer<typeof CreateLinkDto>; // For validated data
export type CreateLinkInputDto = z.input<typeof CreateLinkDto>; // Unvalidated data

export const UpdateLinkDto = z.object({
	url: z.string().url().optional(),
	isPermanent: z.boolean().optional(),
});

export type UpdateLinkDto = z.infer<typeof UpdateLinkDto>;
export type UpdateLinkInputDto = z.input<typeof UpdateLinkDto>;
