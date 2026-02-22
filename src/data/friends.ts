// 友情链接数据配置
// 用于管理友情链接页面的数据

export interface FriendItem {
	id: number;
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags: string[];
}

// 友情链接数据
export const friendsData: FriendItem[] = [
	{
		id: 1,
		title: "紗夕里",
		imgurl: "https://blog.ovofish.com/img/avatar.webp",
		desc: "在你心里-直到永远 Email：sayuri@edu.email.cn Tencent QQ：1709964150",
		siteurl: "https://blog.ovofish.com/",
		tags: ["大佬！"],
	},
	{
		id: 2,
		title: "kongjian",
		imgurl: "https://thirdqq.qlogo.cn/ek_qqapp/AQA8iaMnvNLibEjogZljWuicFlIJTYZnJSCsG8ZUCblZ1rYpXibh6s3R8zw2oqRMed5T6YPo8Uh8/100",
		desc: "这里是兴趣使然的无名小站（ACBD站）_bilbil",
		siteurl: "https://bilbil.cn/",
		tags: ["大佬！"],
	},
	{
		id: 3,
		title: "irislc",
		imgurl: "https://blog.irislc.net/upload/siteImg/siteLogo.webp?v=1739988555693",
		desc: "大佬！",
		siteurl: "https://blog.irislc.net/",
		tags: ["大佬！"],
	},
	{
		id: 4,
		title: "城子的小屋",
		imgurl: "https://xcz.me/img/avatar.jpg",
		desc: "小城子的博客",
		siteurl: "https://xcz.me",
		tags: ["大佬！"],
	},
	{
		id: 5,
		title: "Astro",
		imgurl: "https://avatars.githubusercontent.com/u/44914786?v=4&s=640",
		desc: "The web framework for content-driven websites",
		siteurl: "https://github.com/withastro/astro",
		tags: ["Docs"],
	},
	{
		id: 6,
		title: "Mizuki Docs",
		imgurl: "http://q.qlogo.cn/headimg_dl?dst_uin=3231515355&spec=640&img_type=jpg",
		desc: "Mizuki User Manual",
		siteurl: "https://docs.mizuki.mysqil.com",
		tags: ["Docs"],
	},
];

// 获取所有友情链接数据
export function getFriendsList(): FriendItem[] {
	return friendsData;
}

// 获取随机排序的友情链接数据
export function getShuffledFriendsList(): FriendItem[] {
	const shuffled = [...friendsData];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}
