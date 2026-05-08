import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const monthNames = {
	jan: "January",
	feb: "February",
	mar: "March",
	apr: "April",
	may: "May",
	jun: "June",
	jul: "July",
	aug: "August",
	sep: "September",
	oct: "October",
	nov: "November",
	dec: "December",
};

const monthOrder = {
	jan: 0,
	feb: 1,
	mar: 2,
	apr: 3,
	may: 4,
	jun: 5,
	jul: 6,
	aug: 7,
	sep: 8,
	oct: 9,
	nov: 10,
	dec: 11,
};

export default function () {
	const inputDir = path.resolve(__dirname, "..");
	const filesDir = path.join(inputDir, "newsletter", "files");
	const urlPrefix = "/" + path.relative(inputDir, filesDir);

	const pattern = /^([a-z]{3})(\d{2})\.pdf$/;

	const allNewsletters = fs
		.readdirSync(filesDir)
		.filter((f) => pattern.test(f))
		.map((f) => {
			const [, mon, yr] = f.match(pattern);
			const fullYear = 2000 + Number.parseInt(yr, 10);
			return {
				filename: f,
				url: `${urlPrefix}/${f}`,
				label: `${monthNames[mon]} ${fullYear}`,
				sortKey: fullYear * 12 + monthOrder[mon],
			};
		})
		.sort((a, b) => b.sortKey - a.sortKey);

	return {
		recentNewsletters: allNewsletters.slice(0, 6),
		allNewsletters,
	};
}
