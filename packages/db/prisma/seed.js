import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toNumber(value) {
	const result = Number.parseFloat(value);
	if (Number.isNaN(result)) {
		throw new Error(`Invalid numeric value: ${value}`);
	}
	return result;
}

async function main() {
	const csvPath = path.resolve(process.cwd(), "..", "..", "data", "processed", "metro_metrics.csv");
	const raw = fs.readFileSync(csvPath, "utf8").trim();
	const [header, ...lines] = raw.split(/\r?\n/);

	if (!header || lines.length === 0) {
		throw new Error(`No rows found in ${csvPath}`);
	}

	const metroMap = new Map();
	const metrics = [];

	for (const line of lines) {
		const [metroId, metroName, year, annual, monthly, rent, burden] = line.split(",");
		metroMap.set(metroId, metroName);
		metrics.push({
			metro_id: metroId,
			year: Number.parseInt(year, 10),
			median_annual_income: toNumber(annual),
			median_monthly_income: toNumber(monthly),
			median_gross_rent: toNumber(rent),
			rent_burden_percent: toNumber(burden),
		});
	}

	for (const [id, name] of metroMap.entries()) {
		await prisma.metro.upsert({
			where: { id },
			update: { name },
			create: { id, name },
		});
	}

	for (const metric of metrics) {
		await prisma.metroMetric.upsert({
			where: {
				metro_id_year: {
					metro_id: metric.metro_id,
					year: metric.year,
				},
			},
			update: {
				median_annual_income: metric.median_annual_income,
				median_monthly_income: metric.median_monthly_income,
				median_gross_rent: metric.median_gross_rent,
				rent_burden_percent: metric.rent_burden_percent,
			},
			create: metric,
		});
	}

	await prisma.source.upsert({
		where: { dataset_name: "ACS-aligned placeholder metro metrics (2015-2025 sample)" },
		update: {
			source_url: "https://api.census.gov/data/2023/acs/acs5",
			retrieved_at: new Date(),
			notes: "Seeded from data/processed/metro_metrics.csv with 10 placeholder metros across 2015-2025",
		},
		create: {
			dataset_name: "ACS-aligned placeholder metro metrics (2015-2025 sample)",
			source_url: "https://api.census.gov/data/2023/acs/acs5",
			retrieved_at: new Date(),
			notes: "Seeded from data/processed/metro_metrics.csv with 10 placeholder metros across 2015-2025",
		},
	});

	console.log(`Seeded ${metroMap.size} metros and ${metrics.length} metric rows.`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
