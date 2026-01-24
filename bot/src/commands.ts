/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const ADD_COMMAND = {
	name: "add",
	description: "add shortlink",
	type: 1,
	options: [
		{
			name: "url",
			description: "url to redirect to",
			required: true,
			type: 3, // string
		},
		{
			name: "shortlink",
			description: "string to map redirect link to",
			required: false,
			type: 3, // string
		},
		{
			name: "is_permanent",
			description:
				"whether to use 301 permanent redirect or 302 temporary redirect",
			required: false,
			type: 5, // bool
		},
	],
};

export const DELETE_COMMAND = {
	name: "delete",
	description: "delete shortlink",
	type: 1,
	options: [
		{
			name: "shortlink",
			description: "shortlink to delete",
			required: true,
			type: 3, // string
		},
	],
};
