import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const Link = z.object({
	slug: Str(),
	url: Str(),
});
