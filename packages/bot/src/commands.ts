/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const SHORTER_COMMAND = {
	name: "shorter",
	description: "Manage shortlinks",
	type: 1,
	options: [
		{
			name: "add",
			description: "Add a new shortlink",
			type: 1, // SUB_COMMAND type
			options: [
				{
					name: "destination",
					description: "URL to redirect to",
					required: true,
					type: 3, // string
				},
				{
					name: "alias",
					description: "[OPTIONAL] custom slug to use in shortlink URL",
					required: false,
					type: 3, // string
				},
				{
					name: "is_permanent",
					description:
						"[OPTIONAL] whether to use 301 permanent redirect or 302 temporary redirect",
					required: false,
					type: 5, // bool
				},
			],
		},
		{
			name: "delete",
			description: "Delete an existing shortlink",
			type: 1, // SUB_COMMAND type
			options: [
				{
					name: "alias",
					description: "Shortlink to delete",
					required: true,
					type: 3, // string
				},
			],
		},
		{
			name: "update",
			description: "Change an existing shortlink",
			type: 1, // SUB_COMMAND type
			options: [
				{
					name: "alias",
					description: "An existing shortlink slug",
					required: true,
					type: 3, // string
				},
				{
					name: "destination",
					description: "[OPTIONAL] new URL to redirect to",
					required: false,
					type: 3, // string
				},
				{
					name: "is_permanent",
					description:
						"[OPTIONAL] change to 301 permanent redirect or 302 temporary redirect",
					required: false,
					type: 5, // bool
				},
			],
		},
	],
};
