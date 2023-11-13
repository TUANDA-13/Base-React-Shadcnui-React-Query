import * as icons from "@Assets/icons";

export type Icons = typeof icons;
export type IconName = keyof Icons;
export type IconSize = "small" | "medium" | "large" | number;
