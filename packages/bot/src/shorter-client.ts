import { env } from "cloudflare:workers";
import type {
	ShortlinkCreateRequestInput,
	ShortlinkModel,
	ShortlinkUpdateRequestInput,
} from "./types";
import { formatServiceError, ServiceErrorResponse } from "./types";

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
			throw new Error(
				`HTTP ${response.status}: ${await this.getServiceErrorMessage(response)}`,
			);
		}

		const payload = (await response.json()) as unknown;
		return this.unwrapResult<ShortlinkModel>(payload);
	}

	async delete(slug: string): Promise<void> {
		const deleteUrl = `${this.endpoint}/${slug}`;
		const response = await fetch(deleteUrl, {
			method: "DELETE",
			headers: this.setHeaders(),
		});

		if (!response.ok) {
			throw new Error(
				`HTTP ${response.status}: ${await this.getServiceErrorMessage(response)}`,
			);
		}
	}

	async put(
		slug: string,
		updateParams: ShortlinkUpdateRequestInput,
	): Promise<ShortlinkModel> {
		const updateUrl = `${this.endpoint}/${slug}`;
		const response = await fetch(updateUrl, {
			method: "PUT",
			headers: this.setHeaders(),
			body: JSON.stringify(updateParams),
		});
		if (!response.ok) {
			throw new Error(
				`HTTP ${response.status}: ${await this.getServiceErrorMessage(response)}`,
			);
		}

		const payload = (await response.json()) as unknown;
		return this.unwrapResult<ShortlinkModel>(payload);
	}

	// Needed since chanfana responses look like { "success": boolean, "result": ShortlinkModel }
	private unwrapResult<T>(payload: unknown): T {
		if (
			payload !== null &&
			typeof payload === "object" &&
			"result" in payload
		) {
			return (payload as { result: T }).result;
		}

		return payload as T;
	}

	private async getServiceErrorMessage(response: Response): Promise<string> {
		const bodyText = await response.text();
		if (!bodyText) {
			return response.statusText || "Request failed";
		}

		try {
			const parsed = JSON.parse(bodyText) as unknown;
			const typedError = ServiceErrorResponse.safeParse(parsed);
			if (typedError.success) {
				return formatServiceError(typedError.data);
			}
		} catch {
			// Fall back to raw text below
		}

		return bodyText;
	}
}
