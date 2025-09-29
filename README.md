# envup

Quickly initialise and update .env files based on their associated .env.example files.

## Why use this?

- Auto-initialise .env files based on .env.example files
- Generate dynamic values like timestamps, UUIDs, and hashes
- Load secrets from AWS Secrets Manager
- Merges in new variables when .env.example is updated
- Creates a backup of your local env before updating

## Quick start

```shell
cd my-project
echo "KEY=envup://random" > .env.example
envup
cat .env
```

## Functions

Envup functions are written as URLs, with the protocol being `envup`, the hostname being the function name, the path being the main value, then any query params as required.

**`aws`**

```
KEY="envup://aws/my-secret-name?region=eu-west-1&profile=my-profile"
```

- path: AWS Secret Name
- param `region`: AWS region
- param `profile`: AWS profile name
- param `versionStage`: Version to return. Default "AWSCURRENT"

**hash**

```
KEY="envup://hash/value-to-hash?algo=sha256&encoding=hex"
```

- path: value to hash
- params `algo`: Hashing algorithm supported by Node. Default "sha256"
- params `encoding`: How the output is encoded. Default "hex"

**random**

A `Math.random()` based 11 char long base-36 string

```
KEY=envup://random
```

**timestamp**

`Date.now().toString()`

```
KEY=envup://timestamp
```

**uuid**

`Date.now().toString()`

```
KEY_A=envup://uuid
KEY_B=envup://uuid/4
KEY_C=envup://uuid/7
```

- path: UUID version number. Default "4". Accepts "1", "4", "6", "7"

## Development

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.18. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## Planned

- [ ] Lint env vars
  - [ ] Warn about possible conflicts with system or popular packages
    - https://www.baeldung.com/linux/allowed-characters-variable-names
    - https://dotenv-linter.github.io/#/?id=dotenv-linter
  - [ ] Error on keys without equals
- [ ] Command to compare env files
- [ ] Command to create env files from example
  - [ ] Option to remove comments
  - [x] Compute envup values (aws secrets, random values, hashes, etc)
- [ ] Command to update existing env file from example
  - [x] Merge in new keys
  - [x] Create a backup of the original file
  - [ ] Warn if the new backup isn't ignored by git
