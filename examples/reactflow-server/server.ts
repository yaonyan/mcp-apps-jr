import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type {
  CallToolResult,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const DiagramNodeSchema = z.object({
  id: z.string().describe("Unique identifier for the node"),
  label: z.string().describe("Display label for the node"),
  x: z.number().optional().describe("X position"),
  y: z.number().optional().describe("Y position"),
  type: z.string().optional().describe("Node type (default, input, output)"),
});

const DiagramEdgeSchema = z.object({
  source: z.string().describe("Source node ID"),
  target: z.string().describe("Target node ID"),
  label: z.string().optional().describe("Label for the edge"),
});

const DiagramInputSchema = z.object({
  title: z.string().optional().describe("Title of the diagram"),
  nodes: z
    .array(DiagramNodeSchema)
    .optional()
    .describe("Array of nodes in the diagram"),
  edges: z
    .array(DiagramEdgeSchema)
    .optional()
    .describe("Array of edges connecting nodes"),
});

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "React Flow MCP App Server",
    version: "1.0.0",
  });

  // Two-part registration: tool + resource, tied together by the resource URI.
  const resourceUri = "ui://reactflow/mcp-app.html";

  // Register a tool with UI metadata. When the host calls this tool, it reads
  // `_meta.ui.resourceUri` to know which resource to fetch and render as an
  // interactive UI.
  registerAppTool(
    server,
    "show-reactflow",
    {
      title: "Show React Flow",
      description:
        "Displays an interactive React Flow diagram that can be edited by the user. Pass nodes and edges to create a custom workflow diagram.",
      inputSchema: DiagramInputSchema,
      _meta: { ui: { resourceUri } }, // Links this tool to its UI resource
    },
    async (): Promise<CallToolResult> => {
      return {
        content: [
          {
            type: "text",
            text: "React Flow diagram displayed. Waiting for user edits.",
          },
        ],
      };
    },
  );

  // Register the resource, which returns the bundled HTML/JavaScript for the UI.
  registerAppResource(
    server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
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
