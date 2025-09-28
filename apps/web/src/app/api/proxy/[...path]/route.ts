// apps/web/src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const;
type HttpMethod = (typeof ALLOWED_METHODS)[number];

function getApiBase(): string {
  const url =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3001";
  return url.replace(/\/+$/, "");
}

async function handle(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> } // ✅ params는 Promise
) {
  const method = req.method.toUpperCase() as HttpMethod;
  if (!ALLOWED_METHODS.includes(method)) {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  // ✅ params를 await 한 뒤 사용
  const { path = [] } = await ctx.params;
  const apiBase = getApiBase();
  const pathname = path.join("/");
  const search = req.nextUrl.search ?? ""; // includes leading "?" or empty
  const targetUrl = `${apiBase}/${pathname}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("referer");
  headers.delete("origin");

  const init: RequestInit = {
    method,
    headers,
    body: ["GET", "HEAD"].includes(method) ? undefined : await req.text(),
    redirect: "manual",
  };

  try {
    const res = await fetch(targetUrl, init);
    const resHeaders = new Headers(res.headers);
    resHeaders.set("Vary", "Origin");
    resHeaders.set("Access-Control-Allow-Credentials", "true");

    const body = res.body ? res.body : await res.arrayBuffer();
    return new NextResponse(body as any, { status: res.status, headers: resHeaders });
  } catch (e) {
    return NextResponse.json(
      { error: "Proxy request failed", detail: String(e) },
      { status: 502 }
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
