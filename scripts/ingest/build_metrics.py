from __future__ import annotations

from pathlib import Path
import csv

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "raw"
PROCESSED = ROOT / "data" / "processed" / "metro_metrics.csv"


def compute_monthly_income(annual_income: float) -> float:
    return round(annual_income / 12, 2)


def compute_rent_burden(rent: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        raise ValueError("monthly_income must be positive")
    return round((rent / monthly_income) * 100, 2)


def main() -> None:
    if not PROCESSED.exists():
        raise FileNotFoundError(f"Processed file not found: {PROCESSED}")
    with PROCESSED.open("r", newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    print(f"Validated {len(rows)} processed rows from {PROCESSED}")


if __name__ == "__main__":
    main()
