import { Undefinable } from "./nullable.type";

export type QueryKeyT = [string, Undefinable<object>];
export type PostQueryKeyT = [string, Undefinable<object>, Undefinable<object>];
