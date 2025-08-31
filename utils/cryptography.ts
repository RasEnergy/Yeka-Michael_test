// import jwt from "jsonwebtoken";
// export function sign(payload, privateKey, algorithm) {
// 	return jwt.sign(JSON.stringify(payload), privateKey, {
// 		algorithm,
// 	});
// }
// export function signES256(payload, privateKey) {
// 	return sign(payload, privateKey, "ES256");
// }

import jwt from "jsonwebtoken";

export function sign(
	payload: Record<string, any>,
	privateKey: string | Buffer,
	algorithm: jwt.Algorithm
): string {
	return jwt.sign(JSON.stringify(payload), privateKey, {
		algorithm,
	});
}

export function signES256(
	payload: Record<string, any>,
	privateKey: string | Buffer
): string {
	return sign(payload, privateKey, "ES256");
}
