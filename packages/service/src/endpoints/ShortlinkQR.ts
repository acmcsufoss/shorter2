import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { getShortlinkBySlug } from "../repository";
import type { AppContext } from "../types";
import QRCode from 'qrcode-svg';

export class ShortlinkQR extends OpenAPIRoute {
	schema = {
		tags: ["Public"],
		summary: "Get QR code for a shortlink",
		request: {
			params: z.object({
				slug: z.string(),
			}),
		},
		responses: {
			"200": {
				description: "SVG QR Code",
			},
			"404": {
				description: "Slug not found",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: z.boolean(),
								error: z.string(),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();
		const rawSlug = data.params.slug;
		const slug = rawSlug.replace(/\.svg$/, "");

		const res = await getShortlinkBySlug(c, slug);
		if (!res) {
			return c.json(
				{
					success: false,
					error: "Slug not found",
				},
				404,
			);
		}
		const targetUrl = res.url;
		const svg = new QRCode(targetUrl).svg();


		return c.body(svg, 200, { "Content-Type": "image/svg+xml" });
	}
}
