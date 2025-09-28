# envup

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
  - [ ] Compute envup values (aws secrets, random values, hashes, etc)
