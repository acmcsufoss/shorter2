import { env } from "cloudflare:workers";
import type {
	CreateLinkDto,
	CreateLinkInputDto,
	UpdateLinkDto,
	UpdateLinkInputDto,
} from "@shorter/service";

const endpoint = `${env.SHORTER_ENDPOINT}/links`;

const setHeaders = (authToken: string) => {
	return {
		Authorization: `Bearer ${authToken}`,
		"Content-Type": "application/json",
	};
};

export async function addLink(
	link: CreateLinkInputDto,
	authToken: string,
): Promise<CreateLinkDto> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: setHeaders(authToken),
		body: JSON.stringify(link),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errText}`);
	}

	const data = (await response.json()) as { success: boolean; link: CreateLinkDto };
	return data.link;
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
	updateParams: UpdateLinkInputDto,
	authToken: string,
): Promise<UpdateLinkDto> {
	const updateUrl = `${endpoint}/${slug}`;
	const response = await fetch(updateUrl, {
		method: "PUT",
		headers: setHeaders(authToken),
		body: JSON.stringify(updateParams),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errText}`);
	}

	const data = (await response.json()) as {
		success: boolean;
		link: UpdateLinkDto;
	};
	return data.link;
}
