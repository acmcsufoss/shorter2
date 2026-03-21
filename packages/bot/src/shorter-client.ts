import { env } from "cloudflare:workers";
import { ShortlinkModel, ShortlinkUpdateRequest } from "@shorter2/types";
import type { z } from "zod";

type ShortlinkDto = z.infer<typeof ShortlinkModel>;
type CreateLinkInputDto = {
	slug?: string;
	url: string;
	isPermanent?: boolean;
};
type UpdateLinkInputDto = z.input<typeof ShortlinkUpdateRequest>;
type UpdateLinkDto = Pick<ShortlinkDto, "url" | "isPermanent">;

const endpoint = `${env.SHORTER_ENDPOINT}/_links`;

const setHeaders = (authToken: string) => {
	return {
		Authorization: `Bearer ${authToken}`,
		"Content-Type": "application/json",
	};
};

export async function addLink(
	link: CreateLinkInputDto,
	authToken: string,
): Promise<ShortlinkDto> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: setHeaders(authToken),
		body: JSON.stringify(link),
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`HTTP ${response.status}: ${errText}`);
	}

	const data = (await response.json()) as { success: boolean; link: ShortlinkDto };
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
