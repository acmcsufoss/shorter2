import { Bool, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Link = z.object({
	slug: Str({ required: false }),
	url: z.string().url(),
	isPermanent: Bool({ required: false }).default(false),
});

export interface KvValue {
	url: string;
	isPermanent: boolean;
}

export interface KvEntry {
	key: string; // slug
	value: KvValue;
}

export interface ListOfLinks {
	list: KvEntry[];
}
