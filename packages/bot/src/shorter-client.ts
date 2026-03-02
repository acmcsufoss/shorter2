import { env } from "cloudflare:workers";
import type {
	ShortlinkModel,
	ShortlinkCreateRequest,
	ShortlinkUpdateRequest
} from "./types";

const endpoint = `${env.SHORTER_ENDPOINT}/links`;

const setHeaders = (authToken: string) => {
	return {
		Authorization: `Bearer ${authToken}`,
		"Content-Type": "application/json",
	};
};

export async function addLink(
	shortlink: ShortlinkCreateRequest,
	authToken: string,
): Promise<ShortlinkModel> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: setHeaders(authToken),
		body: JSON.stringify(shortlink),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errText}`);
	}

	return (await response.json()) as ShortlinkModel;
}

export async function deleteLink(
	slug: string,
	authToken: string,
): Promise<void> {
	const deleteUrl = `${endpoint}/${slug}`;
	const response = await fetch(deleteUrl, {
		method: "DELETE",
		headers: setHeaders(authToken),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errText}`);
	}
}

export async function updateLink(
	slug: string,
	updateParams: ShortlinkUpdateRequest,
	authToken: string,
): Promise<ShortlinkModel> {
	const updateUrl = `${endpoint}/${slug}`;
	const response = await fetch(updateUrl, {
		method: "",
		headers: setHeaders(authToken),
		body: JSON.stringify(updateParams),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errText}`);
	}

	return (await response.json()) as ShortlinkModel;
}
