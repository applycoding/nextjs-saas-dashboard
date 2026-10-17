import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeControl } from "@/components/theme-control";
import { ThemeProvider } from "@/components/theme-provider";

describe("theme control", () => {
  it("offers system, light, and dark", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeControl />
      </ThemeProvider>,
    );
    const dark = screen.getByRole("radio", { name: "Dark" });
    await user.click(dark);
    expect(dark).toBeChecked();
    expect(screen.getByRole("radio", { name: "System" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Light" })).toBeInTheDocument();
  });
});
