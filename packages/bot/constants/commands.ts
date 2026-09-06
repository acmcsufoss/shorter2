/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const SHORTER_COMMAND = {
	name: "shorter2",
	description: "Manage shortlinks",
	type: 1,
	options: [
		{
			name: "add",
			description: "Add a new shortlink",
			type: 1, // SUB_COMMAND type
			options: [
				{
					name: "slug",
					description: "Custom slug to use in shortlink URL",
					required: true,
					type: 3, // string
				},
				{
					name: "destination",
					description: "URL to redirect to",
					required: true,
					type: 3, // string
				},
			],
		},
		{
			name: "delete",
			description: "Delete an existing shortlink",
			type: 1, // SUB_COMMAND type
			options: [
				{
					name: "slug",
					description: "Shortlink to delete",
					required: true,
					type: 3, // string
				},
			],
		},
	],
} as const;
