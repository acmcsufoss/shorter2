import type { AddLinkModel, UpdateLinkModel } from "./models";

const endpoint = "https://s.acmcsuf.com/links";

const setHeaders = (authToken: string) => {
	return {
		Authorization: `Bearer ${authToken}`,
		"Content-Type": "application/json",
	};
};

export async function addLink(link: AddLinkModel, authToken: string): Promise<AddLinkModel> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: setHeaders(authToken),
		body: JSON.stringify(link),
	});

	if (!response.ok) {
		throw new Error(`HTTP error. Status: ${response.status}`);
	}

	return await response.json();
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
		throw new Error(`HTTP error. Status: ${response.status}`);
	}
}

export async function updateLink(slug: string, updateParams: UpdateLinkModel, authToken: string): Promise<UpdateLinkModel> {
	const updateUrl = `${endpoint}/${slug}`;
	const response = await fetch(updateUrl, {
		method: "PUT",
		headers: setHeaders(authToken),
		body: JSON.stringify(updateParams),
	});

	if (!response.ok) {
		throw new Error(`HTTP error. Status: ${response.status}`);
	}

	return await response.json();
}
