export function getAuthNonceKey(address: string) {
  return `auth:nonce:${address.toLowerCase()}`;
}
