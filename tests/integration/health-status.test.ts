import { afterEach, describe, expect, it } from "vitest";
import { getDataSourceStatus } from "../../apps/web/src/lib/metrics";

const originalUseDatabase = process.env.USE_DATABASE;
const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  process.env.USE_DATABASE = originalUseDatabase;
  process.env.DATABASE_URL = originalDatabaseUrl;
});

describe("health/source integration", () => {
  it("reports csv mode when database mode is disabled", async () => {
    process.env.USE_DATABASE = "false";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/student_reality_lab";

    const status = await getDataSourceStatus();
    expect(status.configuredMode).toBe("csv");
    expect(status.activeSource).toBe("csv_fallback");
  });

  it("reports fallback when database mode is enabled but unavailable", async () => {
    process.env.USE_DATABASE = "true";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:9999/does_not_exist";

    const status = await getDataSourceStatus();
    expect(status.configuredMode).toBe("database");
    expect(["database", "csv_fallback"]).toContain(status.activeSource);
  });
});
