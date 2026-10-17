import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { KpiCard } from "@/components/kpi-card";
import { RoleBadge } from "@/components/role-badge";
import { SampleDataBanner } from "@/components/sample-data-banner";

describe("dashboard labels", () => {
  it("marks sample data in plain language", () => {
    render(<SampleDataBanner includesSample />);
    expect(screen.getByRole("note").textContent).toMatch(/Sample data/);
    expect(screen.getByRole("note").textContent).toMatch(/not production metrics/i);
  });

  it("says when a view has no seeded rows", () => {
    render(<SampleDataBanner includesSample={false} />);
    expect(screen.getByRole("note").textContent).toMatch(/No seeded sample events/i);
  });

  it("shows a measured count and a placeholder for unmeasured metrics", () => {
    render(
      <div>
        <KpiCard label="Event count" value="12" detail="Includes sample data." measured />
        <KpiCard label="Retention" value="" detail="Not measured in this demo." measured={false} />
      </div>,
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Not measured in this demo.")).toBeInTheDocument();
  });

  it("renders role names", () => {
    render(
      <div>
        <RoleBadge role="owner" />
        <RoleBadge role="viewer" />
      </div>,
    );
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();
  });
});
