"use client"

import * as React from "react"
import {Monitor, Moon, Sun} from "lucide-react"
import {useTheme} from "next-themes"
import {cn} from "@/lib/utils";

export default function ThemeChanger() {
  const {theme, setTheme} = useTheme();

  return (
    <div className="flex items-center justify-between w-full rounded-full bg-muted py-2 px-4">
      <span className="text-sm text-foreground">Theme</span>
      <div
        className={cn(
          "flex gap-1 items-center rounded-full",
          "[&>button]:rounded-md [&>button]:border [&>button]:p-1 [&>button]:transition-all [&>button]:duration-200 [&>button]:ease-in-out",
          "[&>button]:hover:bg-accent [&>button]:hover:shadow-lg",
          "[&>button]:focus-visible:outline-none [&>button]:focus-visible:ring-2 [&>button]:focus-visible:ring-ring",
          "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
          "[&>button]:data-active:bg-accent [&>button]:data-active:shadow-lg",
        )}
      >
        <button type="button" data-active={theme === "system"} onClick={() => setTheme("system")}>
          <Monitor/>
          <span className="sr-only">System theme</span>
        </button>
        <button type="button" data-active={theme === "light"} onClick={() => setTheme("light")}>
          <Sun/>
          <span className="sr-only">Light theme</span>
        </button>
        <button type="button" data-active={theme === "dark"} onClick={() => setTheme("dark")}>
          <Moon/>
          <span className="sr-only">Dark theme</span>
        </button>
      </div>
    </div>
  );
}