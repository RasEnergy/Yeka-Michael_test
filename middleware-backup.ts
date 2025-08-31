import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
	const token =
		request.cookies.get("auth-token")?.value ||
		request.headers.get("authorization")?.replace("Bearer ", "");

	let user = null;

	if (token) {
		try {
			const { payload } = await jwtVerify(
				token,
				new TextEncoder().encode(process.env.JWT_SECRET!)
			);
			user = payload;
		} catch (err) {
			console.error("Invalid token:", err);
		}
	}

	const { pathname } = request.nextUrl;

	// ✅ Allow public access to root and login
	// if (!user && (pathname === "/" || pathname === "/login")) {
	// 	return NextResponse.next();
	// }

	// ✅ Publicly accessible paths
	if (
		!user &&
		(pathname === "/" ||
			pathname === "/login" ||
			pathname.startsWith("/payment"))
	) {
		return NextResponse.next();
	}

	// 🔐 Redirect unauthenticated users trying to access protected routes
	if (!user) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// 🚫 Redirect authenticated users away from login page
	if (user && pathname === "/login") {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// ✅ Allow access to authenticated users
	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|api|logo2.jpg|.*\\.jpg|.*\\.jpeg|.*\\.png|.*\\.svg|.*\\.webp|.*\\.gif|^payment.*|^$).*)",
	],
};
// export const config = {
// 	matcher: [
// 		"/((?!_next/static|_next/image|favicon.ico|api|logo2.jpg|.*\\.jpg|.*\\.jpeg|.*\\.png|.*\\.svg|.*\\.webp|.*\\.gif).*)",
// 	],
// };

// export const config = {
// 	matcher: [
// 		"/((?!_next/static|_next/image|favicon.ico|api|.*\\.(jpg|jpeg|png|svg|webp|gif)).*)",
// 	],
// };

// Apply middleware to all routes except static files and APIs
// export const config = {
// 	matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
// };
// import { NextRequest, NextResponse } from "next/server";
// import { jwtVerify } from "jose";

// export async function middleware(request: NextRequest) {
// 	const token =
// 		request.cookies.get("auth-token")?.value ||
// 		request.headers.get("authorization")?.replace("Bearer ", "");

// 	let user = null;

// 	if (token) {
// 		try {
// 			const { payload } = await jwtVerify(
// 				token,
// 				new TextEncoder().encode(process.env.JWT_SECRET!)
// 			);
// 			user = payload; // This can include id, email, role, etc.
// 		} catch (err) {
// 			console.error("Invalid token:", err);
// 			user = null;
// 		}
// 	}

// 	console.log("Middleware user:", user);

// 	const { pathname } = request.nextUrl;

// 	// If user is NOT logged in AND trying to access a protected page, redirect to /login
// 	if (!user && pathname !== "/login") {
// 		return NextResponse.redirect(new URL("/login", request.url));
// 	}

// 	// If user IS logged in AND tries to access /login, redirect them to /dashboard
// 	if (user && pathname === "/login") {
// 		return NextResponse.redirect(new URL("/dashboard", request.url));
// 	}

// 	// Otherwise, continue
// 	return NextResponse.next();
// }

// // Apply middleware to all routes except static files and API
// export const config = {
// 	matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
// };
