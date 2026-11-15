// Encrypts the private details (Wi-Fi, address…) into index.html.
//
// Usage:
//   node tools/lock-secrets.mjs            → uses .secrets/secrets.json
//   node tools/lock-secrets.mjs --new-code → also generates a fresh access code
//
// .secrets/secrets.json (never committed) looks like:
//   { "code": "ABCD-EFGH-JKMN",
//     "data": { "address": "…", "wifi": { "network": "…", "password": "…" } } }
//
// Only the encrypted blob (AES-GCM, key derived from the code with PBKDF2-SHA256)
// is written to index.html. Guests decrypt it in their browser with the code.

import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const SECRETS = new URL("../.secrets/secrets.json", import.meta.url);
const PAGE = new URL("../index.html", import.meta.url);
const ITER = 600000;

const secrets = JSON.parse(readFileSync(SECRETS, "utf8"));

if (process.argv.includes("--new-code") || !secrets.code) {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O, 1/I/L
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const chars = [...bytes].map(b => alphabet[b % alphabet.length]).join("");
  secrets.code = `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`;
  writeFileSync(SECRETS, JSON.stringify(secrets, null, 2) + "\n");
  console.log("New access code:", secrets.code);
}

const norm = secrets.code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
const b64 = u8 => Buffer.from(u8).toString("base64");
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(norm), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  material, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(secrets.data)));

const blob = { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) };
const page = readFileSync(PAGE, "utf8");
const re = /\/\*LOCKED\*\/[\s\S]*?\/\*\/LOCKED\*\//;
if (!re.test(page)) throw new Error("LOCKED markers not found in index.html");
writeFileSync(PAGE, page.replace(re, `/*LOCKED*/const LOCKED = ${JSON.stringify(blob)};/*/LOCKED*/`));
console.log("Locked", Object.keys(secrets.data).join(", "), "into index.html");
