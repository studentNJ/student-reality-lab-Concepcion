from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed" / "metro_metrics.csv"
METADATA = ROOT / "data" / "processed" / "source-metadata.json"

COMBINED_RAW = RAW / "metro_metrics_raw.csv"
INCOME_RAW = RAW / "income.csv"
RENT_RAW = RAW / "rent.csv"

OUTPUT_COLUMNS = [
    "metro_id",
    "metro_name",
    "year",
    "median_annual_income",
    "median_monthly_income",
    "median_gross_rent",
    "rent_burden_percent",
]


def compute_monthly_income(annual_income: float) -> float:
    return round(annual_income / 12, 2)


def compute_rent_burden(rent: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        raise ValueError("monthly_income must be positive")
    return round((rent / monthly_income) * 100, 2)


def parse_float(value: str, field_name: str) -> float:
    try:
        return float(value)
    except ValueError as exc:
        raise ValueError(f"Invalid numeric value for {field_name}: {value}") from exc


def parse_int(value: str, field_name: str) -> int:
    try:
        return int(value)
    except ValueError as exc:
        raise ValueError(f"Invalid integer value for {field_name}: {value}") from exc


def normalize_name(name: str) -> str:
    return " ".join(name.split())


def read_csv_rows(file_path: Path) -> list[dict[str, str]]:
    with file_path.open("r", newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def build_row(metro_id: str, metro_name: str, year: int, annual_income: float, gross_rent: float) -> dict[str, object]:
    monthly_income = compute_monthly_income(annual_income)
    return {
        "metro_id": metro_id,
        "metro_name": normalize_name(metro_name),
        "year": year,
        "median_annual_income": round(annual_income, 2),
        "median_monthly_income": monthly_income,
        "median_gross_rent": round(gross_rent, 2),
        "rent_burden_percent": compute_rent_burden(gross_rent, monthly_income),
    }


def build_from_combined() -> list[dict[str, object]]:
    rows = read_csv_rows(COMBINED_RAW)
    required = {"metro_id", "metro_name", "year", "median_annual_income", "median_gross_rent"}

    if not rows:
        raise ValueError(f"No rows found in {COMBINED_RAW}")

    missing = required - set(rows[0].keys())
    if missing:
        raise ValueError(f"Missing columns in {COMBINED_RAW.name}: {sorted(missing)}")

    return sorted(
        [
            build_row(
                metro_id=row["metro_id"],
                metro_name=row["metro_name"],
                year=parse_int(row["year"], "year"),
                annual_income=parse_float(row["median_annual_income"], "median_annual_income"),
                gross_rent=parse_float(row["median_gross_rent"], "median_gross_rent"),
            )
            for row in rows
        ],
        key=lambda item: (str(item["metro_id"]), int(item["year"])),
    )


def build_from_split_files() -> list[dict[str, object]]:
    income_rows = read_csv_rows(INCOME_RAW)
    rent_rows = read_csv_rows(RENT_RAW)

    if not income_rows or not rent_rows:
        raise ValueError("Both income.csv and rent.csv must contain at least one row")

    income_required = {"metro_id", "metro_name", "year", "median_annual_income"}
    rent_required = {"metro_id", "year", "median_gross_rent"}

    income_missing = income_required - set(income_rows[0].keys())
    rent_missing = rent_required - set(rent_rows[0].keys())

    if income_missing:
        raise ValueError(f"Missing columns in {INCOME_RAW.name}: {sorted(income_missing)}")
    if rent_missing:
        raise ValueError(f"Missing columns in {RENT_RAW.name}: {sorted(rent_missing)}")

    indexed_rent = {
        (row["metro_id"], parse_int(row["year"], "year")): row
        for row in rent_rows
    }

    built_rows: list[dict[str, object]] = []
    for row in income_rows:
        key = (row["metro_id"], parse_int(row["year"], "year"))
        rent_row = indexed_rent.get(key)
        if rent_row is None:
            raise ValueError(f"Missing rent row for metro/year {key[0]}-{key[1]}")

        built_rows.append(
            build_row(
                metro_id=row["metro_id"],
                metro_name=row["metro_name"],
                year=key[1],
                annual_income=parse_float(row["median_annual_income"], "median_annual_income"),
                gross_rent=parse_float(rent_row["median_gross_rent"], "median_gross_rent"),
            )
        )

    return sorted(built_rows, key=lambda item: (str(item["metro_id"]), int(item["year"])))


def resolve_input_rows() -> list[dict[str, object]]:
    RAW.mkdir(parents=True, exist_ok=True)

    if COMBINED_RAW.exists():
      return build_from_combined()

    if INCOME_RAW.exists() and RENT_RAW.exists():
      return build_from_split_files()

    raise FileNotFoundError(
        "No supported raw inputs found. Add data/raw/metro_metrics_raw.csv or both data/raw/income.csv and data/raw/rent.csv."
    )


def write_processed_rows(rows: Iterable[dict[str, object]]) -> list[dict[str, object]]:
    materialized = list(rows)
    PROCESSED.parent.mkdir(parents=True, exist_ok=True)

    with PROCESSED.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_COLUMNS)
        writer.writeheader()
        writer.writerows(materialized)

    return materialized


def write_metadata(rows: list[dict[str, object]]) -> None:
    years = sorted({int(row["year"]) for row in rows})
    metros = sorted({str(row["metro_id"]) for row in rows})
    payload = {
        "datasetType": "production",
        "displayName": "Production Dataset",
        "source": "Processed from raw files in data/raw/ via scripts/ingest/build_metrics.py",
        "metroCount": len(metros),
        "startYear": years[0] if years else None,
        "endYear": years[-1] if years else None,
        "lastRefreshed": __import__("datetime").date.today().isoformat(),
    }

    with METADATA.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")


def main() -> None:
    rows = write_processed_rows(resolve_input_rows())
    write_metadata(rows)
    print(f"Built {len(rows)} processed rows at {PROCESSED}")


if __name__ == "__main__":
    main()
