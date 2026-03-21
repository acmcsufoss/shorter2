import { z } from "zod";

export const ServiceErrorItem = z.object({
	code: z.number(),
	message: z.string(),
	path: z.array(z.string()).optional(),
});
export type ServiceErrorItem = z.infer<typeof ServiceErrorItem>;

export const ServiceErrorResponse = z.object({
	success: z.literal(false),
	errors: z.array(ServiceErrorItem).min(1),
});
export type ServiceErrorResponse = z.infer<typeof ServiceErrorResponse>;

export function formatServiceError(response: ServiceErrorResponse): string {
	return response.errors
		.map((item) =>
			item.path && item.path.length > 0
				? `${item.path.join(".")}: ${item.message}`
				: item.message,
		)
		.join("; ");
}
