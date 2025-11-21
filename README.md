# @modelcontextprotocol/ext-apps

MCP Extensions Apps SDK.

## Installation

This repo is in flux and isn't published to npm (when it is, we'll probably use the `@modelcontextprotocol/ext-apps` package). Please install it from git for now:

```bash
npm install git+https://github.com/modelcontextprotocol/ext-apps.git
```

## Development Notes

### Build tools in dependencies

The build tools (`esbuild`, `tsx`, `typescript`) are in `dependencies` rather than `devDependencies`. This is intentional: it allows the `prepare` script to run when the package is installed from git, since npm doesn't install devDependencies for git dependencies.

Once the package is published to npm with pre-built `dist/`, these can be moved back to `devDependencies`.
