interface Link {
	slug?: string;
	url?: string;
	isPermanent?: boolean;
}

const endpoint = "https://s.acmcsuf.com/links";

const setHeaders = (authToken: string) => {
	return {
		Authorization: `Bearer ${authToken}`,
		"Content-Type": "application/json",
	};
};

export async function addLink(link: Link, authToken: string): Promise<Link> {
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

export async function updateLink(link: Link, authToken: string): Promise<Link> {
	const response = await fetch(endpoint, {
		method: "PUT",
		headers: setHeaders(authToken),
		body: JSON.stringify(link),
	});

	if (!response.ok) {
		throw new Error(`HTTP error. Status: ${response.status}`);
	}

	return await response.json();
}
