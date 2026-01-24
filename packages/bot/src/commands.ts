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
			name: "destination",
			description: "url to redirect to",
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
};

export const DELETE_COMMAND = {
	name: "delete",
	description: "delete shortlink",
	type: 1,
	options: [
		{
			name: "alias",
			description: "shortlink to delete",
			required: true,
			type: 3, // string
		},
	],
};

export const UPDATE_COMMAND = {
	name: "add",
	description: "change an existing shortlink",
	type: 1,
	options: [
		{
			name: "alias",
			description: "an existing shortlink slug",
			required: true,
			type: 3, // string
		},
		{
			name: "destination",
			description: "[OPTIONAL] new url to redirect to",
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
};
