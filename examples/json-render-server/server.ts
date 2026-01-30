import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const UIElementSchema = z.object({
  key: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
  children: z.array(z.string()).optional(),
  parentKey: z.string().nullable().optional(),
});

const UITreeSchema = z.object({
  root: z.string().describe("Key of the root element"),
  elements: z
    .record(z.string(), UIElementSchema)
    .describe("Flat map of elements by key"),
});

const renderUiInputSchema = z.object({
  uiTree: UITreeSchema.describe("JSON-Render UITree structure"),
  data: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Initial data context"),
  title: z.string().optional().describe("Optional title"),
});

export function createServer(): McpServer {
  const server = new McpServer({
    name: "JSON-Render MCP App Server",
    version: "1.0.0",
  });
  const resourceUri = "ui://json-render/mcp-app.html";

  registerAppTool(
    server,
    "render-ui",
    {
      title: "Render UI",
      description: `Renders interactive UI from JSON-Render UITree (flat format with root + elements map).

Components: Card, Stack, Grid, Table | Text, Metric, Badge, Alert | Input, Checkbox, TextArea, Select | Button

Layout: Stack (direction: horizontal/vertical, spacing: xs/sm/md/lg/xl), Grid (columns: number, gap: xs/sm/md/lg/xl)
Table: Use columns array [{header, key}] and data array of objects. Auto-infers columns if not specified.
  - Filters: Add filters array to enable filtering: [{column, type: "text"|"select"|"number", placeholder?, options?}]
  - Text filter: Case-insensitive contains search
  - Select filter: Dropdown with options for exact match
  - Number filter: Greater than or equal numeric filter

Data binding: Use valuePath="/name" to bind to data.name
Form submit: Button with action: { "name": "__submitForm" }

IMPORTANT: For tables, use Table component instead of Grid/Stack. Grid with many children causes layout issues.`,
      inputSchema: renderUiInputSchema,
      _meta: { ui: { resourceUri } },
    },
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            uiTree: args.uiTree,
            data: args.data || {},
            title: args.title || "Rendered UI",
          }),
        },
      ],
    }),
  );

  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const html = await fs.readFile(
        path.join(DIST_DIR, "mcp-app.html"),
        "utf-8",
      );
      return {
        contents: [
          { uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html },
        ],
      };
    },
  );

  return server;
}
