interface Link {
	slug?: string;
	url?: string;
	isPermanent?: boolean;
}

const endpoint = "https://s.acmcsuf.com/links";

export async function addLink(link: Link): Promise<Link> {
	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(link),
	});

	if (!response.ok) {
		throw new Error(`HTTP error. Status: ${response.status}`);
	}

	return await response.json();
}

export async function deleteLink(slug: string): Promise<void> {
	const deleteUrl = `${endpoint}/${slug}`;
	const response = await fetch(deleteUrl, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error. Status: ${response.status}`);
	}
}

export async function updateLink(link: Link): Promise<Link> {
	const response = await fetch(endpoint, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(link),
	});

	if (!response.ok) {
		throw new Error(`HTTP error. Status: ${response.status}`);
	}

	return await response.json();
}
