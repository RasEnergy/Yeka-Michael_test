import SantimpaySdk from "./santimpay-wallet-sdk";

const PRIVATE_KEY_IN_PEM = `
-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIC+B3+0BOy4mXH6imJ8mOIVlBHSbczQLsQZ721FXbY5loAoGCCqGSM49
AwEHoUQDQgAEcSHW597wbbocX5Dr15HjOXCzPim/NslI+AzbxiO3SB5ETfwcceXS
QyWmnpJd7gvP0sOUu58ZJsXF9VBVxMa9CA==
-----END EC PRIVATE KEY-----
`;

const GATEWAY_MERCHANT_ID = "bd73481e-49b1-4064-a67c-42e0ab513899";

const client = new SantimpaySdk(GATEWAY_MERCHANT_ID, PRIVATE_KEY_IN_PEM, false);

export default client;
