import { useQuery } from "@tanstack/react-query";

const STATUS_API_PATH = "/api/v1/status";
const STATUS_REFRESH_INTERVAL_MS = 60000;

export function getStatusQueryKey() {
  return ["status"];
}

async function fetchStatusData() {
  const response = await fetch(STATUS_API_PATH);

  if (!response.ok) {
    throw new Error("Failed to fetch status");
  }

  return response.json();
}

export function useStatusQuery() {
  return useQuery({
    queryKey: getStatusQueryKey(),
    queryFn: fetchStatusData,
    refetchInterval: STATUS_REFRESH_INTERVAL_MS,
  });
}
