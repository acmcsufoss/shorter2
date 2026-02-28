import { Bool, Str } from "chanfana";
import { z } from "zod";

export const CreateLinkDto = z.object({
  slug: Str({ required: false }).optional(),
  url: z.string().url(),
  isPermanent: Bool({ required: false }).default(false),
});

export type CreateLinkDto = z.infer<typeof CreateLinkDto>; // For validated data
export type CreateLinkInputDto = z.input<typeof CreateLinkDto>; // Unvalidated data

export const UpdateLinkDto = z.object({
  url: z.string().url().optional(),
  isPermanent: Bool({ required: false }).default(false),
});

export type UpdateLinkDto = z.infer<typeof UpdateLinkDto>;
export type UpdateLinkInputDto = z.input<typeof UpdateLinkDto>;
