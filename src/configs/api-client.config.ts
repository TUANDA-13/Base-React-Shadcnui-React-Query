import FetchClient from "@/lib/fetch.util";

export const apiClient = new FetchClient(
  process.env.NEXT_PUBLIC_API_END_POINT || "",
  Number(process.env.NEXT_PUBLIC_FETCH_TIMEOUT) || 3000
);
