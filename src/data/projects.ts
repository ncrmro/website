export interface Project {
	slug: string;
	title: string;
	description: string;
	url: string;
}

export const projects: Project[] = [
	{ slug: 'meze', title: 'Meze', description: 'meze.fyi', url: 'https://meze.fyi' },
	{ slug: 'keystone', title: 'Keystone', description: 'GitHub ncrmro/keystone', url: 'https://github.com/ncrmro/keystone' },
	{ slug: 'catalyst', title: 'Catalyst', description: 'GitHub ncrmro/catalyst', url: 'https://github.com/ncrmro/catalyst' },
	{ slug: 'latinum', title: 'Latinum', description: 'latinum.space', url: 'https://latinum.space' },
];
