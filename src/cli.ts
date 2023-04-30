#!/bin/sh
// 2>/dev/null;DENO_VERSION_RANGE="^1.33.1";DENO_RUN_ARGS="-q --allow-run=wg";set -e;V="$DENO_VERSION_RANGE";A="$DENO_RUN_ARGS";h(){ [ -x "$(command -v $1 2>&1)" ];};g(){ u="$([ $(id -u) != 0 ]&&echo sudo||:)";if h brew;then echo "brew install $1";elif h apt;then echo "($u apt update && $u DEBIAN_FRONTEND=noninteractive apt install -y $1)";elif h yum;then echo "$u yum install -y $1";elif h pacman;then echo "$u pacman -yS --noconfirm $1";elif h opkg-install;then echo "$u opkg-install $1";fi;};p(){ q="$(g $1)";if [ -z "$q" ];then echo "Please install '$1' manually, then try again.">&2;exit 1;fi;eval "o=\"\$(set +o)\";set -x;$q;set +x;eval \"\$o\"">&2;};f(){ h "$1"||p "$1";};U="$(echo "$V"|tr -d '\n'|od -An -tx1|tr ' ' %|tr -d '\n')";D="$(command -v deno||true)";t(){ d="$(mktemp)";rm "${d}";dirname "${d}";};a(){ [ -n $D ];};s(){ a&&[ -x "$R/deno" ]&&[ "$R/deno" = "$D" ]&&return;deno eval "import{satisfies as e}from'https://deno.land/x/semver@v1.4.1/mod.ts';Deno.exit(e(Deno.version.deno,'$V')?0:1);">/dev/null 2>&1;};e(){ R="$(t)/deno-range-$V/bin";mkdir -p "$R";export PATH="$R:$PATH";[ -x "$R/deno" ]&&return;a&&s&&([ -L "$R/deno" ]||ln -s "$D" "$R/deno")&&return;f curl;v="$(curl -sSfL "https://semver-version.deno.dev/api/github/denoland/deno/$U")";i="$(t)/deno-$v";[ -L "$R/deno" ]||ln -s "$i/bin/deno" "$R/deno";s && return;f unzip;([ "${A#*-q}" != "$A" ]&&exec 2>/dev/null;curl -fsSL https://deno.land/install.sh|DENO_INSTALL="$i" sh -s $DENO_INSTALL_ARGS "$v">&2);};e;exec "$R/deno" run $A "$0" "$@"

import { isValidPrefix, nextMatchingKeyPair } from "../mod.ts";

const prefix: string | undefined = Deno.args[0];

if (!isValidPrefix(prefix)) {
  console.error(`
Usage: ./src/cli.ts <prefix>
Note that <prefix> must be a non-empty string of base64 characters.
`);
  Deno.exit(2);
}

console.error(`Checking for public keys starting with ${prefix}...`);
if (prefix.length > 2) {
  console.error(
    `(with a prefix of more than very few characters, this may take a while!)`,
  );
}

const abortController = new AbortController();
Deno.addSignalListener("SIGINT", abortController.abort.bind(abortController));

const signal: AbortSignal = abortController.signal;
while (!signal.aborted) {
  const [privateKey, publicKey] = await nextMatchingKeyPair(
    prefix,
    signal,
  );
  if (!signal.aborted) {
    console.log(`${privateKey} ${publicKey}`);
  }
}
