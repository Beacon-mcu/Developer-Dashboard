// Stellar's library expects a global Buffer, which browsers do not have.
// Import this module FIRST (before anything that uses Stellar) so it runs before they do.
import { Buffer } from "buffer/"; // the trailing slash picks the npm package, not a Node built-in

const g = globalThis as unknown as { Buffer?: typeof Buffer };
if (!g.Buffer) g.Buffer = Buffer;
