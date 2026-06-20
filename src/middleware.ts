import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  if (host.startsWith("www.")) {
    return NextResponse.rewrite(new URL("/home1.html", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
