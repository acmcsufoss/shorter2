import { env } from "cloudflare:workers";
import type {
	ShortlinkCreateRequestInput,
	ShortlinkModel,
	ShortlinkUpdateRequestInput,
} from "./types";

export class ShortlinkClient {
	private authToken = "";
	private endpoint = `${env.SHORTER_ENDPOINT}/_links`;

	constructor(authToken: string) {
		this.authToken = authToken;
	}

	setHeaders() {
		return {
			Authorization: `Bearer ${this.authToken}`,
			"Content-Type": "application/json",
		};
	}

	async post(shortlink: ShortlinkCreateRequestInput): Promise<ShortlinkModel> {
		const response = await fetch(this.endpoint, {
			method: "POST",
			headers: this.setHeaders(),
			body: JSON.stringify(shortlink),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errText}`);
		}

		return (await response.json()) as ShortlinkModel;
	}

	async delete(slug: string): Promise<void> {
		const deleteUrl = `${this.endpoint}/${slug}`;
		const response = await fetch(deleteUrl, {
			method: "DELETE",
			headers: this.setHeaders(),
		});

		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errText}`);
		}
	}

	async put(
		slug: string,
		updateParams: ShortlinkUpdateRequestInput,
	): Promise<ShortlinkModel> {
		const updateUrl = `${this.endpoint}/${slug}`;
		const response = await fetch(updateUrl, {
			method: "",
			headers: this.setHeaders(),
			body: JSON.stringify(updateParams),
		});
		if (!response.ok) {
			const errText = await response.text();
			throw new Error(`HTTP ${response.status}: ${errText}`);
		}

		return (await response.json()) as ShortlinkModel;
	}
}
