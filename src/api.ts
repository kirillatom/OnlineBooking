const BASE_URL = "https://practice.modx.pro/api";

type ApiResponse = any;

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function handleResponse(res: Response): Promise<ApiResponse> {
  let data: any = null;
  const contentType = res.headers.get("content-type") || "";

  try {
    if (contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch (err) {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error || data.errors)) ||
      `API error: ${res.status}`;
    throw new ApiError(String(message), res.status, data);
  }

  return data;
}

function buildQuery(params: Record<string, any>) {
  const search = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const val = params[key];
    if (val === undefined || val === null || val === "") return;

    if (Array.isArray(val)) {
      val.forEach((v) => search.append(key, String(v)));
    } else {
      search.append(key, String(val));
    }
  });
  return search.toString();
}

export async function getMaxCapacity(): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/table/max-capacity`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return handleResponse(res);
}

export async function getPlacements(limit = 50, pageNo = 1): Promise<ApiResponse> {
  const qs = buildQuery({ limit, pageNo });
  const res = await fetch(`${BASE_URL}/placement?${qs}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return handleResponse(res);
}

export async function getTables(
  placementUuid: string,
  filters: Record<string, any> = {}
): Promise<ApiResponse> {
  if (!placementUuid) {
    throw new ApiError("placementUuid is required", 400, null);
  }

  const params = {
    placement_uuid: placementUuid,
    ...filters,
  };

  const qs = buildQuery(params);
  const res = await fetch(`${BASE_URL}/table?${qs}`, {
    method: "GET",
    headers: { "Accept": "application/json" },
  });
  return handleResponse(res);
}

export async function createReservation(data: any): Promise<ApiResponse> {
  const res = await fetch(`${BASE_URL}/reservation`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
