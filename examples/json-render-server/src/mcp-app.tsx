import "@/index.css";
import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps";
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { JSONUIProvider, Renderer, useData } from "@json-render/react";
import type { UITree } from "@json-render/core";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { componentRegistry } from "./registry";
import styles from "./mcp-app.module.css";

interface RenderData {
  uiTree: UITree;
  data?: Record<string, unknown>;
  title?: string;
}

function ErrorDisplay({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: "8px",
        backgroundColor: "#fee2e2",
        borderLeft: "4px solid #ef4444",
        color: "#991b1b",
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  );
}

function LoadingDisplay() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: "16px",
        color: "#6b7280",
      }}
    >
      Connecting...
    </div>
  );
}

function WelcomeDisplay() {
  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
      <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "12px" }}>
        JSON-Render App
      </h2>
      <p style={{ marginBottom: "20px" }}>
        Dynamically renders interactive UIs from JSON-Render trees
      </p>
      <div
        style={{
          padding: "16px",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          fontSize: "14px",
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "left",
        }}
      >
        <p>
          <strong>Components:</strong> Card, Stack, Grid, Table | Text, Metric,
          Badge, Alert | Input, Checkbox, TextArea, Select | Button
        </p>
        <p style={{ marginTop: "12px" }}>
          Try: <em>"Create a dashboard showing sales metrics"</em>
        </p>
      </div>
    </div>
  );
}

function JsonRenderApp() {
  const [renderData, setRenderData] = useState<RenderData | null>(null);
  const [hostContext, setHostContext] = useState<
    McpUiHostContext | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [appInstance, setAppInstance] =
    useState<ReturnType<typeof useApp>["app"]>(null);

  const { app, error: connectionError } = useApp({
    appInfo: { name: "JSON-Render App", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      setAppInstance(app);
      app.onteardown = async () => ({});
      app.ontoolinput = async (input) => console.info("Tool input:", input);
      app.ontoolresult = async (result) => {
        try {
          const text = result.content?.find((c) => c.type === "text")?.text;
          if (text) {
            setRenderData(JSON.parse(text) as RenderData);
            setError(null);
          }
        } catch (e) {
          setError("Failed to parse UI data: " + (e as Error).message);
        }
      };
      app.ontoolcancelled = (params) =>
        console.info("Tool cancelled:", params.reason);
      app.onerror = (err) => setError(err.message);
      app.onhostcontextchanged = (params) =>
        setHostContext((prev) => ({ ...prev, ...params }));
    },
  });

  useHostStyles(app);
  useEffect(() => {
    if (app) setHostContext(app.getHostContext());
  }, [app]);

  const actionHandlers = {
    __submitForm: async () => {
      if ((window as any).__submitForm) await (window as any).__submitForm();
      return { success: true };
    },
  };

  if (connectionError) {
    return (
      <ErrorDisplay message={`Connection Error: ${connectionError.message}`} />
    );
  }

  if (!app) {
    return <LoadingDisplay />;
  }

  return (
    <JsonRenderAppInner
      renderData={renderData}
      hostContext={hostContext}
      error={error}
      actionHandlers={actionHandlers}
      app={appInstance}
    />
  );
}

interface JsonRenderAppInnerProps {
  renderData: RenderData | null;
  hostContext?: McpUiHostContext;
  error: string | null;
  actionHandlers: Record<
    string,
    (params: Record<string, unknown>) => Promise<unknown> | unknown
  >;
  app: ReturnType<typeof useApp>["app"];
}

function JsonRenderAppInner({
  renderData,
  hostContext,
  error,
  actionHandlers,
  app,
}: JsonRenderAppInnerProps) {
  const safeAreaStyle = {
    paddingTop: hostContext?.safeAreaInsets?.top,
    paddingRight: hostContext?.safeAreaInsets?.right,
    paddingBottom: hostContext?.safeAreaInsets?.bottom,
    paddingLeft: hostContext?.safeAreaInsets?.left,
  };

  if (error) {
    return (
      <main className={styles.main} style={safeAreaStyle}>
        <ErrorDisplay message={error} />
      </main>
    );
  }

  if (!renderData) {
    return (
      <main className={styles.main} style={safeAreaStyle}>
        <WelcomeDisplay />
      </main>
    );
  }

  return (
    <main className={styles.main} style={safeAreaStyle}>
      {renderData.title && (
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "24px" }}>
          {renderData.title}
        </h1>
      )}
      <JSONUIProvider
        registry={componentRegistry}
        initialData={renderData.data || {}}
        actionHandlers={actionHandlers}
      >
        <FormSubmitHandler app={app} />
        <Renderer tree={renderData.uiTree} registry={componentRegistry} />
      </JSONUIProvider>
    </main>
  );
}

function FormSubmitHandler({ app }: { app: ReturnType<typeof useApp>["app"] }) {
  const { data } = useData();

  useEffect(() => {
    if (!app) return;

    (window as any).__submitForm = async () => {
      try {
        await app.sendMessage({
          role: "user",
          content: [
            {
              type: "text",
              text: `Form submitted successfully!\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to submit form:", error);
      }
    };

    return () => {
      delete (window as any).__submitForm;
    };
  }, [app, data]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JsonRenderApp />
  </StrictMode>,
);
