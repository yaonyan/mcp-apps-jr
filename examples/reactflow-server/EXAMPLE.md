# React Flow Server Example Usage

## Overview

This example demonstrates how to use the React Flow MCP App to create interactive workflow diagrams that can be edited by users and submitted back to the conversation.

## How to Test

### 1. Start the Development Server

```bash
npm run dev
```

This starts the server on `http://localhost:3001/mcp`

### 2. Use the Tool

The tool accepts the following input schema:

```typescript
{
  title?: string;          // Optional title for the diagram
  nodes?: Array<{          // Array of nodes to display
    id: string;            // Unique identifier
    label: string;         // Display label
    x?: number;            // X position (optional, auto-positioned if not provided)
    y?: number;            // Y position (optional, auto-positioned if not provided)
    type?: string;         // Node type: 'default', 'input', 'output' (optional)
  }>;
  edges?: Array<{          // Array of edges connecting nodes
    source: string;        // Source node ID
    target: string;        // Target node ID
    label?: string;        // Optional label for the edge
  }>;
}
```

## Example Calls

### Example 1: Simple Architecture Diagram

```json
{
  "title": "Architecture diagram (modules + data flow)",
  "nodes": [
    { "id": "ui", "label": "UI APP (AppKit)", "x": 100, "y": 50 },
    {
      "id": "sidebar",
      "label": "Sidebar\nProjects\nThreads",
      "x": 50,
      "y": 150
    },
    {
      "id": "main",
      "label": "Main Split View\nChat View | Diff View",
      "x": 350,
      "y": 150
    },
    {
      "id": "models",
      "label": "View Models\n(state + actions)",
      "x": 150,
      "y": 280
    },
    {
      "id": "scheduler",
      "label": "UI Update Scheduler\n(debounce / coalesce)",
      "x": 350,
      "y": 280
    },
    { "id": "core", "label": "Core (in-process)", "x": 250, "y": 420 },
    { "id": "thread", "label": "ThreadStore\n(SQLite)", "x": 50, "y": 520 },
    { "id": "repo", "label": "RepoService\n(git CLI)", "x": 250, "y": 520 },
    {
      "id": "agent",
      "label": "AgentOrchestrator\n(jobs + routing)",
      "x": 450,
      "y": 520
    }
  ],
  "edges": [
    { "source": "ui", "target": "sidebar", "label": "selection" },
    { "source": "ui", "target": "main", "label": "stream tokens" },
    { "source": "sidebar", "target": "models", "label": "refresh/status" },
    { "source": "main", "target": "scheduler", "label": "stream tokens" },
    { "source": "models", "target": "core", "label": "commands/actions" },
    { "source": "scheduler", "target": "core", "label": "batched" },
    { "source": "core", "target": "thread" },
    { "source": "core", "target": "repo" },
    { "source": "core", "target": "agent" }
  ]
}
```

### Example 2: Simple Workflow

```json
{
  "title": "Customer Onboarding Flow",
  "nodes": [
    { "id": "start", "label": "Start", "type": "input" },
    { "id": "register", "label": "Register Account" },
    { "id": "verify", "label": "Verify Email" },
    { "id": "setup", "label": "Setup Profile" },
    { "id": "complete", "label": "Complete", "type": "output" }
  ],
  "edges": [
    { "source": "start", "target": "register" },
    { "source": "register", "target": "verify" },
    { "source": "verify", "target": "setup" },
    { "source": "setup", "target": "complete" }
  ]
}
```

### Example 3: Default Diagram (No Input)

If you call the tool without any parameters, it will display a default 3-node diagram:

```json
{}
```

## User Interaction

Once the diagram is displayed:

1. **Drag nodes** to reposition them
2. **Click and drag from a node handle** to create new connections
3. **Delete edges** by selecting them and pressing Delete/Backspace
4. **Use the MiniMap** in the bottom-right for navigation
5. **Use the Controls** for zoom and fit-to-view
6. **Click "Submit Changes"** to send the edited diagram back to the conversation

## Receiving User Edits

When the user clicks "Submit Changes", the app sends a message back with the updated diagram structure:

```json
{
  "title": "Architecture diagram (modules + data flow)",
  "nodes": [
    {
      "id": "ui",
      "label": "UI APP (AppKit)",
      "x": 120,
      "y": 65,
      "type": "default"
    }
    // ... other nodes with updated positions
  ],
  "edges": [
    {
      "source": "ui",
      "target": "sidebar",
      "label": "selection"
    }
    // ... other edges
  ]
}
```

The model can then parse this JSON to understand how the user has modified the workflow.

## Use Cases

- **Architecture diagrams**: Visualize system components and data flow
- **Workflow design**: Create and modify business process flows
- **Data pipelines**: Design ETL or data processing workflows
- **State machines**: Visualize state transitions
- **Dependency graphs**: Show relationships between modules or services
- **Mind maps**: Create hierarchical thought structures
