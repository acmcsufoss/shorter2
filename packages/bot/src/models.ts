export interface AddLinkModel {
	slug?: string;
	url: string;
	isPermanent?: boolean;
}

export interface UpdateLinkModel {
	url?: string;
	isPermanent?: boolean;
}

