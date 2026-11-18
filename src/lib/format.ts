export const formatDate = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

export const shortAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-6)}`;
