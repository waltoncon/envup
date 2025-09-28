import { readFile, writeFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import { parse, parsedToString } from "./parse";

const env = await readFile("./test-env-files/all.env", "utf-8");

await writeFile(
  "./test-env-files/all.env.out",
  parsedToString(parse(env)),
  "utf-8"
);

const envStrings = {
  basic: `# Simple key/value
APP_NAME=MyApp
PORT=3000
DEBUG=true
`,

  comments: `# Full line comment
APP_MODE=production # Inline comment after value
#=weird comment
KEY#WITH_HASH=value
`,

  duplicates: `# Duplicate keys
DUPLICATE=first
DUPLICATE=second
DUPLICATE=third
`,

  emptyAndMissing: `# Empty value
EMPTY_KEY=
# Missing value (invalid in some parsers)
MISSING_VALUE
# Key with only whitespace
BLANK_KEY=     
`,

  export: `# Exported variables with quotes
export APP_NAME="MyExportedApp"
export PORT=8080
export DEBUG=true

# Spaces around equal signs
export SPACED_KEY = "value with spaces"
export ANOTHER_KEY=  "trim this"

# Single quotes
export SINGLE_QUOTE='single quoted value'
export NESTED_QUOTES="He said 'hello'"

# Escaped characters
export ESCAPED_QUOTES="She said \"hi\""
export PATH_WITH_SPECIAL_CHARS="/usr/local/bin:/opt/bin:$PATH"

# Multiline value using quotes
export PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
line1
line2
line3
-----END RSA PRIVATE KEY-----"

# Special characters
export PASSWORD=p@$$w0rd!
export URL="https://example.com/query?foo=bar&baz=qux"
export JSON_STRING='{"foo":"bar","num":123}'
export UNICODE="Привет🌍"

# Empty values
export EMPTY_KEY=
export BLANK_KEY="   "

# Inline comments
export APP_MODE=production # this is the mode
export FEATURE_FLAG=true # feature toggle

# Duplicate keys
export DUPLICATE=first
export DUPLICATE=second
`,

  multiline: `# Multiline values (often break parsers!)
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
line1
line2
line3
-----END RSA PRIVATE KEY-----"

SQL_QUERY="SELECT *
FROM users
WHERE active = true;"
`,

  quotes: `# Quoted values
DOUBLE_QUOTED="Hello World"
SINGLE_QUOTED='Hello World'
NESTED_QUOTES="He said 'hi'"
ESCAPED_QUOTES="She said \"hello\""
`,

  spaces: `# Spaces around keys/values
  KEY_WITH_SPACES = value with spaces   
KEY_WITH_QUOTES =   "  padded quotes   "
TRAILING_SPACE=endswithspace 
`,

  specialChars: `# Special characters
PASSWORD=p@$$w0rd!
URL=https://example.com/query?foo=bar&baz=qux
JSON_STRING={"foo":"bar","num":123}
UNICODE=Привет🌍
`,
};

describe("parsing", () => {
  for (const [name, content] of Object.entries(envStrings)) {
    it(`parses ${name} correctly`, () => {
      const parsed = parse(content);
      const roundTripped = parsedToString(parsed);
      expect(roundTripped).toBe(content);
    });
  }
});
