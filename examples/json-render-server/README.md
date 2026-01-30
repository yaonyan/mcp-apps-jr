# JSON-Render MCP App

**Universal, Simple, Powerful** - Dynamically render any UI from JSON schemas in your MCP conversations.

## 🎯 Core Concept (KISS Principle)

One tool, infinite possibilities:

```
User describes UI → AI generates JSON → App renders instantly
```

No need for multiple specialized tools - this single `render-ui` tool handles dashboards, forms, charts, tables, and more through a unified JSON interface.

## ✨ Features

### **Display & Data** 📊

- **Metrics** - Revenue, KPIs, analytics with formatting (currency, percent, number)
- **Table** - Data grid with columns and rows (shadcn/ui)
- **Cards** - Organized content sections (shadcn/ui)
- **Badges & Alerts** - Status indicators, notifications (shadcn/ui)

### **Forms & Input** 📝

- **Input** - Text, email, password inputs (shadcn/ui)
- **Select** - Dropdowns with options (shadcn/ui)
- **Checkbox** - Boolean selections (shadcn/ui)
- **TextArea** - Multi-line text input (shadcn/ui)

### **Layout** 🎨

- **Stack** - Vertical/horizontal layouts with spacing (xs/sm/md/lg/xl)
- **Grid** - Responsive multi-column layouts with gap control
- **Card** - Grouped content with titles and descriptions

### **Interactions** 🔄

- **Buttons** - Actions with loading states
- **Data Binding** - Dynamic values from data paths
- **MCP Tool Calls** - Buttons can trigger other MCP tools

## 🚀 Quick Start

### Install & Build

```bash
npm install
npm run build
npm run serve
```

Server runs on `http://localhost:3001/mcp`

### Test with Claude

1. Use `cloudflared` to expose locally:

   ```bash
   npx cloudflared tunnel --url http://localhost:3001
   ```

2. Add as custom connector in Claude (Settings → Connectors)

3. Try: _"Create a sales dashboard with revenue metrics"_

## 📘 Usage Examples

### Example 1: Simple Metrics Dashboard

```json
{
  "uiTree": {
    "type": "Grid",
    "props": { "columns": 3, "gap": "md" },
    "children": [
      {
        "type": "Card",
        "props": { "title": "Revenue" },
        "children": [
          {
            "type": "Metric",
            "props": {
              "label": "Total Revenue",
              "valuePath": "/revenue",
              "format": "currency",
              "change": "+12%",
              "trend": "up"
            }
          }
        ]
      },
      {
        "type": "Card",
        "props": { "title": "Growth" },
        "children": [
          {
            "type": "Metric",
            "props": {
              "label": "Growth Rate",
              "valuePath": "/growth",
              "format": "percent"
            }
          }
        ]
      }
    ]
  },
  "data": {
    "revenue": 125000,
    "growth": 0.15
  },
  "title": "Sales Dashboard"
}
```

### Example 2: Data Table

```json
{
  "uiTree": {
    "root": "card1",
    "elements": {
      "card1": {
        "key": "card1",
        "type": "Card",
        "props": { "title": "Current Employees" },
        "children": ["table1"]
      },
      "table1": {
        "key": "table1",
        "type": "Table",
        "props": {
          "columns": [
            { "header": "Name", "key": "name" },
            { "header": "Department", "key": "department" },
            { "header": "Role", "key": "role" },
            { "header": "Salary", "key": "salary" }
          ],
          "dataPath": "employees"
        }
      }
    }
  },
  "data": {
    "employees": [
      {
        "name": "Alice Johnson",
        "department": "Engineering",
        "role": "Senior Developer",
        "salary": "$95,000"
      },
      {
        "name": "Bob Smith",
        "department": "Sales",
        "role": "Manager",
        "salary": "$85,000"
      }
    ]
  }
}
```

### Example 2.5: Table with Filters

```json
{
  "uiTree": {
    "root": "card1",
    "elements": {
      "card1": {
        "key": "card1",
        "type": "Card",
        "props": { "title": "消费记录筛选" },
        "children": ["table1"]
      },
      "table1": {
        "key": "table1",
        "type": "Table",
        "props": {
          "columns": [
            { "header": "地域", "key": "region" },
            { "header": "用户名", "key": "userName" },
            { "header": "消费金额", "key": "amount" },
            { "header": "商品类别", "key": "category" }
          ],
          "filters": [
            {
              "column": "region",
              "type": "select",
              "placeholder": "选择地域",
              "options": ["华北", "华东", "华南", "华中"]
            },
            {
              "column": "userName",
              "type": "text",
              "placeholder": "搜索用户名"
            },
            {
              "column": "amount",
              "type": "number",
              "placeholder": "最低金额"
            }
          ],
          "data": [
            {
              "region": "华北",
              "userName": "张三",
              "amount": "128.50",
              "category": "食品"
            },
            {
              "region": "华东",
              "userName": "李四",
              "amount": "89.99",
              "category": "衣服"
            }
          ]
        }
      }
    }
  }
}
```

### Example 3: Interactive Form

```json
{
  "uiTree": {
    "type": "Card",
    "props": { "title": "Feedback Form" },
    "children": [
      {
        "type": "TextField",
        "props": {
          "label": "Name",
          "placeholder": "Enter your name",
          "required": true
        }
      },
      {
        "type": "Select",
        "props": {
          "label": "Rating",
          "options": [
            { "value": "5", "label": "⭐⭐⭐⭐⭐ Excellent" },
            { "value": "4", "label": "⭐⭐⭐⭐ Good" }
          ]
        }
      },
      {
        "type": "Button",
        "props": {
          "label": "Submit",
          "variant": "primary"
        }
      }
    ]
  }
}
```

## 🎨 Component Reference

### Layout Components

- **Card** - `{ title?, subtitle? }` (shadcn/ui)
- **Stack** - `{ direction: "horizontal"|"vertical", spacing?: "xs"|"sm"|"md"|"lg"|"xl", align? }`
- **Grid** - `{ columns?, gap?: "xs"|"sm"|"md"|"lg"|"xl" }`

### Display Components

- **Text** - `{ text?, content?, variant?: "heading"|"subheading"|"body"|"muted"|"caption", size?: "sm"|"md"|"lg" }`
- **Metric** - `{ label, valuePath?, value?, format?: "currency"|"percent"|"number" }`
- **Badge** - `{ label, variant?: "default"|"secondary"|"destructive"|"outline" }` (shadcn/ui)
- **Alert** - `{ title?, message, variant?: "default"|"destructive" }` (shadcn/ui)

### Data Components

- **Table** - `{ columns: Array<{header, key, width?}>, dataPath?, data?, filters? }` (shadcn/ui)
  - Auto-infers columns from data if not specified
  - Supports both static data and data binding via dataPath
  - **Filters**: `Array<{column, type?: "text"|"select"|"number", placeholder?, options?}>`
    - `text`: Text search (case-insensitive, contains match)
    - `select`: Dropdown with options (exact match)
    - `number`: Numeric filter (greater than or equal)
  - Example:
    ```json
    {
      "filters": [
        {
          "column": "region",
          "type": "select",
          "placeholder": "选择地域",
          "options": ["华北", "华东"]
        },
        { "column": "userName", "type": "text", "placeholder": "搜索用户名" },
        { "column": "amount", "type": "number", "placeholder": "最低金额" }
      ]
    }
    ```

### Form Components

- **Input** - `{ label?, placeholder?, type?, required?, valuePath? }` (shadcn/ui)
- **Select** - `{ label?, options: Array<{value, label}|string>, placeholder?, valuePath? }` (shadcn/ui)
- **Checkbox** - `{ label, valuePath? }` (shadcn/ui)
- **TextArea** - `{ label?, placeholder?, rows?, valuePath? }` (shadcn/ui)

### Action Components

- **Button** - `{ label, variant?: "primary"|"secondary"|"danger"|"outline", action?, disabled? }` (shadcn/ui)

## 🔄 Data Binding

Use `valuePath` to bind to data:

```json
{
  "type": "Metric",
  "props": {
    "valuePath": "/revenue"
  }
}
```

Lookup: `/revenue` → `data.revenue`, `/user/name` → `data.user.name`

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  render-ui Tool (MCP Server)            │
│  - Accepts JSON tree + data             │
│  - Returns as tool result                │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  JSON-Render App (React)                │
│  - Receives tree via ontoolresult        │
│  - Recursively renders components        │
│  - Handles actions & data binding        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Component Registry                      │
│  - 20+ pre-built components              │
│  - Type-safe, styled, interactive        │
└─────────────────────────────────────────┘
```

## 🛠️ Development

```bash
# Development mode (auto-rebuild + watch)
npm run dev

# Build only
npm run build

# Serve only
npm run serve
```

## 📦 Tech Stack

- **MCP Apps SDK** - Host communication
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool with single-file bundling

## 🎯 Design Philosophy (KISS)

1. **One Tool, Many UIs** - Single `render-ui` tool handles everything
2. **JSON-First** - Declarative, predictable, AI-friendly
3. **No External Dependencies** - Components use vanilla CSS-in-JS
4. **Type-Safe** - Full TypeScript coverage
5. **Extensible** - Easy to add custom components

## 📄 License

MIT

---

**Built with** ❤️ **using MCP Apps SDK**
