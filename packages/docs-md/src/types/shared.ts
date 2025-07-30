import type { SandpackTheme } from "@codesandbox/sandpack-react";
import type { PartialDeep } from "type-fest";

import type { SchemaValue } from "./chunk.ts";

export type PillVariant =
  | "error"
  | "warning"
  | "info"
  | "success"
  | "primary"
  | "secondary";

export type SectionVariant = "default" | "top-level" | "breakout";

export type DisplayTypeInfo = {
  label: string;
  linkedLabel: string;
  children: DisplayTypeInfo[];
  breakoutSubTypes: Map<string, SchemaValue>;
};

export type PropertyAnnotations = {
  title: string;
  variant: PillVariant;
};

export type TryItNowProps = {
  /**
   * These are dependencies that are required by the code snippet,
   * like "zod" or an npm package.
   */
  externalDependencies?: Record<string, string>;
  /**
   * Starting value of the editor
   */
  defaultValue?: string;
  /**
   * Experimental: When enabled, the editor will automatically
   * scan for external dependencies from npm as the user adds them
   * as imports.
   */
  _enableUnsafeAutoImport?: boolean;
  layoutStyle?: React.CSSProperties;
  currentTheme?: "dark" | "light";
  themes?: Record<"dark" | "light", PartialDeep<SandpackTheme>>;
};
