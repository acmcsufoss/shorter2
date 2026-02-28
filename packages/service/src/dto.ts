import { Bool, Str } from "chanfana";
import { z } from "zod";

export const Link = z.object({
  slug: Str({ required: false }).optional(),
  url: z.string().url(),
  isPermanent: Bool({ required: false }).default(false),
});

export type Link = z.infer<typeof Link>; // For validated data
export type LinkInput = z.input<typeof Link>; // Unvalidated data

export const UpdateLink = z.object({
  url: z.string().url().optional(),
  isPermanent: Bool({ required: false }).default(false),
});

export type UpdateLink = z.infer<typeof UpdateLink>;
export type UpdateLinkInput = z.input<typeof UpdateLink>;
