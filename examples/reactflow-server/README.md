# Example: React Flow Server

An MCP App example demonstrating [React Flow](https://reactflow.dev/) integration with an interactive flow diagram. The model can pass in workflow data, which is rendered as an editable diagram that users can modify and submit back.

## MCP Client Configuration

Add to your MCP client configuration (stdio transport):

```json
{
  "mcpServers": {
    "reactflow": {
      "command": "npx",
      "args": [
        "-y",
        "--silent",
        "--registry=https://registry.npmjs.org/",
        "@modelcontextprotocol/server-reactflow",
        "--stdio"
      ]
    }
  }
}
```

### Local Development

To test local modifications, use this configuration (replace `~/code/ext-apps` with your clone path):

```json
{
  "mcpServers": {
    "reactflow": {
      "command": "bash",
      "args": [
        "-c",
        "cd ~/code/ext-apps/examples/reactflow-server && npm run build >&2 && node dist/index.js --stdio"
      ]
    }
  }
}
```

## Overview

- **Model-driven diagrams**: Accepts nodes and edges data from the model as tool input
- **Interactive editing**: Users can drag nodes, create new connections, and modify the workflow
- **Submit changes**: Submit button sends edited diagram back to the conversation
- React Flow integration with MCP Apps SDK
- MiniMap and Controls for easy navigation
- React UI using the [`useApp()`](https://modelcontextprotocol.github.io/ext-apps/api/functions/_modelcontextprotocol_ext-apps_react.useApp.html) hook

## Usage Example

When calling the tool, you can pass in diagram data:

```json
{
  "title": "Architecture diagram (modules + data flow)",
  "nodes": [
    { "id": "ui", "label": "UI APP (AppKit)", "x": 100, "y": 50 },
    { "id": "sidebar", "label": "Sidebar", "x": 50, "y": 150 },
    { "id": "main", "label": "Main Split View", "x": 300, "y": 150 },
    { "id": "core", "label": "Core (in-process)", "x": 200, "y": 350 }
  ],
  "edges": [
    { "source": "ui", "target": "sidebar", "label": "selection" },
    { "source": "ui", "target": "main", "label": "stream tokens" },
    { "source": "sidebar", "target": "core", "label": "refresh/status" },
    { "source": "main", "target": "core", "label": "batched" }
  ]
}
```

The user can then edit the diagram and submit their changes back to the conversation.

## Key Files

- [`server.ts`](server.ts) - MCP server with tool and resource registration
- [`mcp-app.html`](mcp-app.html) / [`src/mcp-app.tsx`](src/mcp-app.tsx) - React Flow UI using `useApp()` hook
- [`EXAMPLE.md`](EXAMPLE.md) - Detailed usage examples and test cases

## Getting Started

```bash
npm install
npm run dev
```

## How It Works

1. The server registers a `show-reactflow` tool with metadata linking it to a UI HTML resource (`ui://reactflow/mcp-app.html`).
2. When the tool is invoked with diagram data (nodes and edges), the Host renders the UI from the resource.
3. The UI receives the tool input via `ontoolinput` handler and parses the nodes/edges data.
4. React Flow renders the diagram, allowing users to drag nodes, create connections, and modify the layout.
5. When the user clicks "Submit Changes", the edited diagram is sent back to the host via `sendMessage()`.
6. The model receives the updated workflow structure and can continue the conversation with the changes.

## Build System

This example bundles into a single HTML file using Vite with `vite-plugin-singlefile` — see [`vite.config.ts`](vite.config.ts). This allows all UI content to be served as a single MCP resource.
