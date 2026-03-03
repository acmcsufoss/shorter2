import { z } from "zod";

export const ServiceErrorItem = z.object({
	code: z.number(),
	message: z.string(),
	path: z.array(z.string()).optional(),
});
export type ServiceErrorItem = z.infer<typeof ServiceErrorItem>;

export const ServiceValidationErrorResponse = z.object({
	success: z.literal(false),
	errors: z.array(ServiceErrorItem).min(1),
});
export type ServiceValidationErrorResponse = z.infer<
	typeof ServiceValidationErrorResponse
>;

export const ServiceSimpleErrorResponse = z.object({
	success: z.literal(false).optional(),
	error: z.string(),
});
export type ServiceSimpleErrorResponse = z.infer<
	typeof ServiceSimpleErrorResponse
>;

export const ServiceErrorResponse = z.union([
	ServiceValidationErrorResponse,
	ServiceSimpleErrorResponse,
]);
export type ServiceErrorResponse = z.infer<typeof ServiceErrorResponse>;

export function formatServiceError(response: ServiceErrorResponse): string {
	if ("errors" in response) {
		return response.errors
			.map((item) =>
				item.path && item.path.length > 0
					? `${item.path.join(".")}: ${item.message}`
					: item.message,
			)
			.join("; ");
	}

	return response.error;
}
