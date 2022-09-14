# wg-bruteforce-custom-key

Create a custom wireguard key, where its public key starts with a specific
string.

## Prerequisites

Requires the `wg` command-line tool. You can usually find it in a package named
`wireguard-tools`.

For example, on Debian/Ubuntu:

```sh
sudo apt install wireguard-tools
```

## Download

```sh
git clone https://github.com/hugojosefson/wg-bruteforce-custom-key
cd wg-bruteforce-custom-key
```

## Usage

```sh
./src/cli.ts <public_key_prefix>
```

...where `<public_key_prefix>` is any string (using base64 alphabet only) for
your wireguard public key to start with.

Example:

```sh
./src/cli.ts "mylaptop"
```
