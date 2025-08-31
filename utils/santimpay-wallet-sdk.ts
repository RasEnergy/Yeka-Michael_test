import axios, { AxiosResponse } from "axios";
import { signES256 } from "./cryptography";
import { PRODUCTION_BASE_URL } from "./constants";

interface InitiatePaymentPayload {
	amount: number;
	paymentReason: string;
	merchantId: string;
	generated: number;
}

interface DirectPaymentPayload extends InitiatePaymentPayload {
	paymentMethod: string;
	phoneNumber: string;
}

interface TransactionStatusPayload {
	id: string;
	merId: string;
	generated: number;
}

class SantimpaySdk {
	private merchantId: string;
	private privateKey: string;
	private baseUrl: string;

	constructor(
		merchantId: string,
		privateKey: string,
		testBed: boolean = false
	) {
		this.privateKey = privateKey;
		this.merchantId = merchantId;
		this.baseUrl = PRODUCTION_BASE_URL;
		if (testBed) {
			this.baseUrl = PRODUCTION_BASE_URL; // You may add a TEST_BASE_URL if needed
		}
	}

	private generateSignedTokenForInitiatePayment(
		amount: number,
		paymentReason: string
	): string {
		const time = Math.floor(Date.now() / 1000);
		const payload: InitiatePaymentPayload = {
			amount,
			paymentReason,
			merchantId: this.merchantId,
			generated: time,
		};
		return signES256(payload, this.privateKey);
	}

	private generateSignedTokenForDirectPayment(
		amount: number,
		paymentReason: string,
		paymentMethod: string,
		phoneNumber: string
	): string {
		const time = Math.floor(Date.now() / 1000);
		const payload: DirectPaymentPayload = {
			amount,
			paymentReason,
			paymentMethod,
			phoneNumber,
			merchantId: this.merchantId,
			generated: time,
		};
		return signES256(payload, this.privateKey);
	}

	private generateSignedTokenForDirectPaymentOrB2C(
		amount: number,
		paymentReason: string,
		paymentMethod: string,
		phoneNumber: string
	): string {
		return this.generateSignedTokenForDirectPayment(
			amount,
			paymentReason,
			paymentMethod,
			phoneNumber
		);
	}

	private generateSignedTokenForGetTransaction(id: string): string {
		const time = Math.floor(Date.now() / 1000);
		const payload: TransactionStatusPayload = {
			id,
			merId: this.merchantId,
			generated: time,
		};
		return signES256(payload, this.privateKey);
	}

	async generatePaymentUrl(
		id: string | number,
		amount: number,
		paymentReason: string,
		successRedirectUrl: string,
		failureRedirectUrl: string,
		notifyUrl: string,
		phoneNumber: string = "",
		cancelRedirectUrl: string = ""
	): Promise<string> {
		try {
			const token = this.generateSignedTokenForInitiatePayment(
				amount,
				paymentReason
			);
			const payload = {
				id: id.toString(),
				amount,
				reason: paymentReason,
				merchantId: this.merchantId,
				signedToken: token,
				successRedirectUrl,
				failureRedirectUrl,
				notifyUrl,
				cancelRedirectUrl,
				phoneNumber,
			};

			const response: AxiosResponse = await axios.post(
				`${this.baseUrl}/initiate-payment`,
				payload
			);

			if (response.status === 200) {
				return response.data.url;
			} else {
				throw new Error("Failed to initiate payment");
			}
		} catch (error: any) {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		}
	}

	async sendToCustomer(
		id: string,
		amount: number,
		paymentReason: string,
		phoneNumber: string,
		paymentMethod: string,
		notifyUrl: string
	): Promise<any> {
		try {
			const token = this.generateSignedTokenForDirectPaymentOrB2C(
				amount,
				paymentReason,
				paymentMethod,
				phoneNumber
			);
			const payload = {
				id,
				clientReference: id,
				amount,
				reason: paymentReason,
				merchantId: this.merchantId,
				signedToken: token,
				receiverAccountNumber: phoneNumber,
				notifyUrl,
				paymentMethod,
			};

			const response: AxiosResponse = await axios.post(
				`${this.baseUrl}/payout-transfer`,
				payload
			);

			if (response.status === 200) {
				return response.data;
			} else {
				throw new Error("Failed to initiate B2C");
			}
		} catch (error: any) {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		}
	}

	async directPayment(
		id: string,
		amount: number,
		paymentReason: string,
		notifyUrl: string,
		phoneNumber: string,
		paymentMethod: string
	): Promise<any> {
		try {
			const token = this.generateSignedTokenForDirectPayment(
				amount,
				paymentReason,
				paymentMethod,
				phoneNumber
			);

			const payload = {
				id,
				amount,
				reason: paymentReason,
				merchantId: this.merchantId,
				signedToken: token,
				phoneNumber,
				paymentMethod,
				notifyUrl,
			};

			const response: AxiosResponse = await axios.post(
				`${this.baseUrl}/direct-payment`,
				payload
			);

			if (response.status === 200) {
				return response.data;
			} else {
				throw new Error("Failed to initiate direct payment");
			}
		} catch (error: any) {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		}
	}

	async checkTransactionStatus(id: string): Promise<any> {
		try {
			const token = this.generateSignedTokenForGetTransaction(id);
			const payload = {
				id,
				merchantId: this.merchantId,
				signedToken: token,
			};

			const response: AxiosResponse = await axios.post(
				`${this.baseUrl}/fetch-transaction-status`,
				payload
			);

			if (response.status === 200) {
				return response.data;
			} else {
				throw new Error("Failed to fetch transaction status");
			}
		} catch (error: any) {
			if (error.response?.data) {
				throw error.response.data;
			}
			throw error;
		}
	}
}

export default SantimpaySdk;
// import axios from "axios";
// import { signES256 } from "./cryptography.js";
// import { PRODUCTION_BASE_URL } from "./constants.js";
// export class SantimpaySdk {
// 	constructor(merchantId, privateKey, testBed = false) {
// 		this.privateKey = privateKey;
// 		this.merchantId = merchantId;
// 		this.baseUrl = PRODUCTION_BASE_URL;
// 		if (testBed) {
// 			this.baseUrl = PRODUCTION_BASE_URL;
// 		}
// 	}

// 	generateSignedTokenForInitiatePayment(amount, paymentReason) {
// 		const time = Math.floor(Date.now() / 1000);
// 		const payload = {
// 			amount,
// 			paymentReason,
// 			merchantId: this.merchantId,
// 			generated: time,
// 		};
// 		return signES256(payload, this.privateKey);
// 	}

// 	generateSignedTokenForDirectPayment(
// 		amount,
// 		paymentReason,
// 		paymentMethod,
// 		phoneNumber
// 	) {
// 		const time = Math.floor(Date.now() / 1000);
// 		const payload = {
// 			amount,
// 			paymentReason,
// 			paymentMethod,
// 			phoneNumber,
// 			merchantId: this.merchantId,
// 			generated: time,
// 		};
// 		return signES256(payload, this.privateKey);
// 	}

// 	generateSignedTokenForGetTransaction(id) {
// 		const time = Math.floor(Date.now() / 1000);
// 		const payload = {
// 			id,
// 			merId: this.merchantId,
// 			generated: time,
// 		};
// 		return signES256(payload, this.privateKey);
// 	}

// 	async generatePaymentUrl(
// 		id,
// 		amount,
// 		paymentReason,
// 		successRedirectUrl,
// 		failureRedirectUrl,
// 		notifyUrl,
// 		phoneNumber = "",
// 		cancelRedirectUrl = ""
// 	) {
// 		try {
// 			const token = this.generateSignedTokenForInitiatePayment(
// 				amount,
// 				paymentReason
// 			);
// 			const payload = {
// 				id: id.toString(),
// 				amount,
// 				reason: paymentReason,
// 				merchantId: this.merchantId,
// 				signedToken: token,
// 				successRedirectUrl,
// 				failureRedirectUrl,
// 				notifyUrl,
// 				cancelRedirectUrl,
// 				phoneNumber,
// 			};

// 			if (phoneNumber && phoneNumber.length > 0) {
// 				payload.phoneNumber = phoneNumber;
// 			}

// 			const response = await axios.post(
// 				`${this.baseUrl}/initiate-payment`,
// 				payload
// 			);

// 			if (response.status === 200) {
// 				console.log("response" + response.data.url);
// 				return response.data.url;
// 			} else {
// 				throw new Error("Failed to initiate payment");
// 			}
// 		} catch (error) {
// 			if (error.response && error.response.data) {
// 				throw error.response.data;
// 			}
// 			throw error;
// 		}
// 	}

// 	async sendToCustomer(
// 		id,
// 		amount,
// 		paymentReason,
// 		phoneNumber,
// 		paymentMethod,
// 		notifyUrl
// 	) {
// 		try {
// 			const token = this.generateSignedTokenForDirectPaymentOrB2C(
// 				amount,
// 				paymentReason,
// 				this.merchantId,
// 				paymentMethod,
// 				phoneNumber
// 			);
// 			const payload = {
// 				id,
// 				clientReference: id,
// 				amount,
// 				reason: paymentReason,
// 				merchantId: this.merchantId,
// 				signedToken: token,
// 				receiverAccountNumber: phoneNumber,
// 				notifyUrl,
// 				paymentMethod,
// 			};
// 			const response = await axios.post(
// 				`${this.baseUrl}/payout-transfer`,
// 				payload
// 			);
// 			if (response.status === 200) {
// 				return response.data;
// 			} else {
// 				throw new Error("Failed to initiate B2C");
// 			}
// 		} catch (error) {
// 			if (error.response && error.response.data) {
// 				throw error.response.data;
// 			}
// 			throw error;
// 		}
// 	}

// 	generateSignedTokenForDirectPaymentOrB2C(
// 		amount,
// 		paymentReason,
// 		paymentMethod,
// 		phoneNumber
// 	) {
// 		const time = Math.floor(Date.now() / 1000);
// 		const payload = {
// 			amount,
// 			paymentReason,
// 			paymentMethod,
// 			phoneNumber,
// 			merchantId: this.merchantId,
// 			generated: time,
// 		};
// 		return signES256(payload, this.privateKey);
// 	}

// 	async directPayment(
// 		id,
// 		amount,
// 		paymentReason,
// 		notifyUrl,
// 		phoneNumber,
// 		paymentMethod
// 	) {
// 		try {
// 			const token = this.generateSignedTokenForDirectPayment(
// 				amount,
// 				paymentReason,
// 				paymentMethod,
// 				phoneNumber
// 			);
// 			const payload = {
// 				id,
// 				amount,
// 				reason: paymentReason,
// 				merchantId: this.merchantId,
// 				signedToken: token,
// 				phoneNumber,
// 				paymentMethod,
// 				notifyUrl,
// 			};
// 			if (phoneNumber && phoneNumber.length > 0) {
// 				payload.phoneNumber = phoneNumber;
// 			}
// 			const response = await axios.post(
// 				`${this.baseUrl}/direct-payment`,
// 				payload

// 				// {
// 				// headers: {
// 				//   Authorization: `Bearer ${this.token}`
// 				// }
// 				// }
// 			);

// 			if (response.status === 200) {
// 				return response.data;
// 			} else {
// 				throw new Error("Failed to initiate direct payment");
// 			}
// 		} catch (error) {
// 			if (error.response && error.response.data) {
// 				throw error.response.data;
// 			}
// 			throw error;
// 		}
// 	}

// 	async checkTransactionStatus(id) {
// 		try {
// 			const token = this.generateSignedTokenForGetTransaction(id);
// 			const data = {
// 				id,
// 				merchantId: this.merchantId,
// 				signedToken: token,
// 			};
// 			console.log("checking");
// 			console.log(data);
// 			const response = await axios.post(
// 				`${this.baseUrl}/fetch-transaction-status`,
// 				{
// 					id,
// 					merchantId: this.merchantId,
// 					signedToken: token,
// 				}
// 				// {
// 				// headers: {
// 				//   Authorization: `Bearer ${this.token}`
// 				// }
// 				// }
// 			);

// 			if (response.status === 200) {
// 				return response.data;
// 			} else {
// 				throw new Error("Failed to initiate payment");
// 			}
// 		} catch (error) {
// 			if (error.response && error.response.data) {
// 				throw error.response.data;
// 			}
// 			throw error;
// 		}
// 	}
// }
// export default SantimpaySdk;
