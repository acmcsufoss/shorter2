import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchMock = vi.fn();

vi.mock("cloudflare:workers", () => ({
	env: {
		SHORTER_ENDPOINT: "https://s.acmcsuf.com",
	},
}));

const { addLink, deleteLink, updateLink } = await import("../src/shorter-client");

beforeEach(() => {
	fetchMock.mockReset();
	vi.stubGlobal("fetch", fetchMock);
});

describe("shorter client", () => {
	it("posts new links to the protected service endpoint", async () => {
		fetchMock.mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					link: {
						slug: "example",
						url: "https://example.com",
						isPermanent: false,
					},
				}),
				{ status: 200 },
			),
		);

		const link = await addLink(
			{ slug: "example", url: "https://example.com" },
			"api-key",
		);

		expect(fetchMock).toHaveBeenCalledWith("https://s.acmcsuf.com/_links", {
			method: "POST",
			headers: {
				Authorization: "Bearer api-key",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				slug: "example",
				url: "https://example.com",
			}),
		});
		expect(link.slug).toBe("example");
	});

	it("uses the protected slug route for deletes", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

		await deleteLink("example", "api-key");

		expect(fetchMock).toHaveBeenCalledWith(
			"https://s.acmcsuf.com/_links/example",
			{
				method: "DELETE",
				headers: {
					Authorization: "Bearer api-key",
					"Content-Type": "application/json",
				},
			},
		);
	});

	it("throws the upstream status and body when updates fail", async () => {
		fetchMock.mockResolvedValue(
			new Response("not found", {
				status: 404,
			}),
		);

		await expect(
			updateLink("missing", { url: "https://example.com/new" }, "api-key"),
		).rejects.toThrow("HTTP 404: not found");
	});
});
