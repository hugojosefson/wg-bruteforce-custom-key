#!/usr/bin/env -S deno run --allow-run

import { nextMatchingKeyPair } from "../mod.ts";

const prefix: string | undefined = Deno.args[0];

console.error(`Checking for public keys starting with ${prefix}...`);

while (true) {
  const [privateKey, publicKey] = await nextMatchingKeyPair(prefix);
  console.log(`${privateKey} ${publicKey}`);
}
