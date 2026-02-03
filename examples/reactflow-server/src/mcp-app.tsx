/**
 * @file App that demonstrates React Flow integration with MCP Apps SDK.
 */
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp } from "@modelcontextprotocol/ext-apps/react";
import { StrictMode, useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import styles from "./mcp-app.module.css";

// Default nodes if no data is provided
const defaultNodes: Node[] = [
  { id: "1", position: { x: 0, y: 0 }, data: { label: "Node 1" } },
  { id: "2", position: { x: 0, y: 100 }, data: { label: "Node 2" } },
  { id: "3", position: { x: 200, y: 50 }, data: { label: "Node 3" } },
];

const defaultEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

interface DiagramInput {
  title?: string;
  nodes?: Array<{
    id: string;
    label: string;
    x?: number;
    y?: number;
    type?: string;
  }>;
  edges?: Array<{
    source: string;
    target: string;
    label?: string;
  }>;
}

function parseInputToReactFlow(input: DiagramInput): {
  nodes: Node[];
  edges: Edge[];
} {
  const nodes: Node[] = (input.nodes || []).map((node, idx) => ({
    id: node.id,
    type: node.type || "default",
    position: {
      x: node.x ?? idx * 150,
      y: node.y ?? idx * 100,
    },
    data: { label: node.label },
  }));

  const edges: Edge[] = (input.edges || []).map((edge, idx) => ({
    id: `e${edge.source}-${edge.target}-${idx}`,
    source: edge.source,
    target: edge.target,
    label: edge.label,
  }));

  return { nodes, edges };
}

function ReactFlowApp() {
  const [hostContext, setHostContext] = useState<
    McpUiHostContext | undefined
  >();
  const [diagramTitle, setDiagramTitle] = useState<string>("Workflow Diagram");
  const [initialNodes, setInitialNodes] = useState<Node[]>(defaultNodes);
  const [initialEdges, setInitialEdges] = useState<Edge[]>(defaultEdges);

  // `useApp` (1) creates an `App` instance, (2) calls `onAppCreated` to
  // register handlers, and (3) calls `connect()` on the `App` instance.
  const { app, error } = useApp({
    appInfo: { name: "React Flow App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.onteardown = async () => {
        console.info("App is being torn down");
        return {};
      };

      app.ontoolinput = async (input) => {
        console.info("Received tool input:", input);
        const args = input.arguments as DiagramInput;
        if (args.title) {
          setDiagramTitle(args.title);
        }
        if (args.nodes || args.edges) {
          const { nodes, edges } = parseInputToReactFlow(args);
          if (nodes.length > 0) setInitialNodes(nodes);
          if (edges.length > 0) setInitialEdges(edges);
        }
      };

      app.onerror = console.error;

      app.onhostcontextchanged = (params) => {
        setHostContext((prev) => ({ ...prev, ...params }));
      };
    },
  });

  useEffect(() => {
    if (app) {
      setHostContext(app.getHostContext());
    }
  }, [app]);

  if (error)
    return (
      <div>
        <strong>ERROR:</strong> {error.message}
      </div>
    );
  if (!app) return <div>Connecting...</div>;

  return (
    <ReactFlowAppInner
      app={app}
      hostContext={hostContext}
      title={diagramTitle}
      initialNodes={initialNodes}
      initialEdges={initialEdges}
    />
  );
}

interface ReactFlowAppInnerProps {
  app: any;
  hostContext?: McpUiHostContext;
  title: string;
  initialNodes: Node[];
  initialEdges: Edge[];
}

function ReactFlowAppInner({
  app,
  hostContext,
  title,
  initialNodes,
  initialEdges,
}: ReactFlowAppInnerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detect dark mode from host context or system preference
  const isDarkMode =
    hostContext?.colorScheme === "dark" ||
    (hostContext?.colorScheme === undefined &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Update nodes/edges when initialNodes/initialEdges change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Convert nodes and edges to a simple format for submission
      const submissionData = {
        title,
        nodes: nodes.map((node) => ({
          id: node.id,
          label: node.data?.label || "",
          x: node.position.x,
          y: node.position.y,
          type: node.type || "default",
        })),
        edges: edges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          label: edge.label || "",
        })),
      };

      console.info("Submitting diagram:", submissionData);

      // Send the edited diagram back to the host
      await app.sendMessage({
        role: "user",
        content: [
          {
            type: "text",
            text: `Updated workflow diagram:\n\n${JSON.stringify(submissionData, null, 2)}`,
          },
        ],
      });

      console.info("Diagram submitted successfully");
    } catch (error) {
      console.error("Error submitting diagram:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [app, title, nodes, edges]);

  return (
    <main
      className={`${styles.main} ${isDarkMode ? styles.dark : styles.light}`}
      style={{
        paddingTop: hostContext?.safeAreaInsets?.top,
        paddingRight: hostContext?.safeAreaInsets?.right,
        paddingBottom: hostContext?.safeAreaInsets?.bottom,
        paddingLeft: hostContext?.safeAreaInsets?.left,
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Changes"}
        </button>
      </div>
      <div className={styles.flowContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap
            style={{ width: 120, height: 80 }}
            nodeStrokeWidth={3}
            zoomable
            pannable
          />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactFlowApp />
  </StrictMode>,
);
