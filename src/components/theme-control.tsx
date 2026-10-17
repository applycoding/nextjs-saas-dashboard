"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const CHOICES = ["system", "light", "dark"] as const;

type ThemeChoice = (typeof CHOICES)[number];

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return CHOICES.some((choice) => choice === value);
}

function choiceLabel(choice: ThemeChoice): string {
  switch (choice) {
    case "system":
      return "System";
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    default: {
      const exhaustive: never = choice;
      return exhaustive;
    }
  }
}

export function ThemeControl() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const meta = document.querySelector('meta[name="color-scheme"]');
    const stored = isThemeChoice(theme) ? theme : "system";
    const content = stored === "system" ? "light dark" : stored;
    meta?.setAttribute("content", content);
    document.documentElement.style.colorScheme = content;
  }, [mounted, theme]);

  return (
    <fieldset className="flex items-center gap-1 rounded-lg border border-border p-0.5">
      <legend className="sr-only">Color scheme</legend>
      {CHOICES.map((choice) => {
        const selected = mounted && theme === choice;
        return (
          <label
            key={choice}
            className={`cursor-pointer rounded-md px-2 py-1 text-xs ${selected ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            <input
              className="sr-only"
              type="radio"
              name="color-scheme"
              value={choice}
              checked={selected}
              onChange={() => setTheme(choice)}
            />
            {choiceLabel(choice)}
          </label>
        );
      })}
    </fieldset>
  );
}
