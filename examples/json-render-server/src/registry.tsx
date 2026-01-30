import type {
  ComponentRegistry,
  ComponentRenderProps,
} from "@json-render/react";
import { useDataValue, useDataBinding } from "@json-render/react";
import { useState, useMemo } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Input as ShadcnInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card as ShadcnCard,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import {
  Alert as ShadcnAlert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type definitions for component props
interface CardProps {
  title?: string;
  subtitle?: string;
}

interface StackProps {
  direction?: "horizontal" | "vertical";
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  align?: "center" | "start" | "end" | "stretch";
}

interface GridProps {
  columns?: number;
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
}

interface TextProps {
  text?: string;
  content?: string;
  variant?: "body" | "heading" | "subheading" | "caption" | "muted";
  size?: "sm" | "md" | "lg";
}

interface MetricProps {
  label?: string;
  valuePath?: string;
  value?: number;
  format?: "currency" | "percent" | "number";
}

interface BadgeProps {
  label?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

interface AlertProps {
  title?: string;
  message?: string;
  variant?: "default" | "destructive";
}

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: string;
  valuePath?: string;
}

interface CheckboxProps {
  label?: string;
  disabled?: boolean;
  valuePath?: string;
}

interface TextAreaProps {
  label?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  valuePath?: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options?: (string | SelectOption)[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  valuePath?: string;
}

interface ButtonProps {
  label?: string;
  action?: { name: string; [key: string]: unknown };
  variant?: "primary" | "secondary" | "danger" | "outline";
  disabled?: boolean;
  icon?: string;
}

interface TableColumn {
  header: string;
  key: string;
  width?: string;
}

interface TableFilter {
  column: string;
  type?: "text" | "select" | "number";
  placeholder?: string;
  options?: string[];
}

interface TableProps {
  columns?: TableColumn[];
  dataPath?: string;
  data?: Array<Record<string, unknown>>;
  filters?: TableFilter[];
}

// Layout Components

export function Card({ element, children }: ComponentRenderProps) {
  const { title = "", subtitle = "" } = element.props as CardProps;
  return (
    <ShadcnCard>
      {(title || subtitle) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </ShadcnCard>
  );
}

export function Stack({ element, children }: ComponentRenderProps) {
  const {
    direction = "vertical",
    spacing = "md",
    align = "stretch",
  } = element.props as StackProps;
  const spacingMap = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };
  const alignMap = {
    center: "items-center",
    start: "items-start",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div
      className={`flex ${direction === "horizontal" ? "flex-row" : "flex-col"} ${alignMap[align]} ${spacingMap[spacing]}`}
    >
      {children}
    </div>
  );
}

export function Grid({ element, children }: ComponentRenderProps) {
  const { columns = 2, gap = "md" } = element.props as GridProps;
  const gapMap = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };

  return (
    <div
      className={`grid ${gapMap[gap]}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
}

// Display Components

export function Text({ element }: ComponentRenderProps) {
  const {
    text,
    content,
    variant = "body",
    size = "md",
  } = element.props as TextProps;
  const displayText = text || content;

  if (variant === "heading") {
    const sizeMap = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };
    return <h2 className={`${sizeMap[size]} font-semibold`}>{displayText}</h2>;
  }
  if (variant === "subheading")
    return <h3 className="text-lg font-semibold">{displayText}</h3>;
  if (variant === "muted")
    return <p className="text-sm text-muted-foreground">{displayText}</p>;
  if (variant === "caption")
    return <p className="text-xs text-muted-foreground">{displayText}</p>;
  return <p>{displayText}</p>;
}

export function Metric({ element }: ComponentRenderProps) {
  const {
    label,
    valuePath,
    value: staticValue,
    format = "number",
  } = element.props as MetricProps;
  const dynamicValue = useDataValue(valuePath ? String(valuePath) : "");
  const value = valuePath ? dynamicValue : staticValue;

  const formatters = {
    currency: (v: number) =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(v),
    percent: (v: number) =>
      new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 1,
      }).format(v),
    number: (v: number) => new Intl.NumberFormat("en-US").format(v),
  };

  const formattedValue =
    value != null
      ? (formatters[format as keyof typeof formatters]?.(Number(value)) ??
        String(value))
      : "—";

  return (
    <div className="p-4">
      <div className="text-xs font-medium uppercase text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-3xl font-bold">{formattedValue}</div>
    </div>
  );
}

export function Badge({ element }: ComponentRenderProps) {
  const { label, variant = "default" } = element.props as BadgeProps;
  return (
    <ShadcnBadge
      variant={variant as "default" | "secondary" | "destructive" | "outline"}
    >
      {label}
    </ShadcnBadge>
  );
}

export function Alert({ element, children }: ComponentRenderProps) {
  const {
    title,
    message = "",
    variant = "default",
  } = element.props as AlertProps;
  return (
    <ShadcnAlert variant={variant as "default" | "destructive"}>
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{message || children}</AlertDescription>
    </ShadcnAlert>
  );
}

// Form Components

export function Input({ element }: ComponentRenderProps) {
  const {
    label = "",
    placeholder = "",
    type = "text",
    required = false,
    disabled = false,
    icon = "",
    valuePath = "",
  } = element.props as InputProps;
  const [value, setValue] = useDataBinding(String(valuePath));

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-foreground">
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ShadcnInput
        type={type}
        placeholder={placeholder || undefined}
        value={String(value || "")}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function CheckboxField({ element }: ComponentRenderProps) {
  const {
    label,
    disabled = false,
    valuePath = "",
  } = element.props as CheckboxProps;
  const [value, setValue] = useDataBinding(String(valuePath));

  return (
    <div className="flex items-center space-x-2">
      <ShadcnCheckbox
        checked={!!value}
        disabled={disabled}
        onCheckedChange={setValue}
      />
      <Label className="text-sm font-normal cursor-pointer">{label}</Label>
    </div>
  );
}

export function TextArea({ element }: ComponentRenderProps) {
  const {
    label = "",
    placeholder = "",
    rows = 4,
    required = false,
    disabled = false,
    valuePath = "",
  } = element.props as TextAreaProps;
  const [value, setValue] = useDataBinding(String(valuePath));

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ShadcnTextarea
        placeholder={placeholder || undefined}
        rows={rows}
        value={String(value || "")}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export function SelectField({ element }: ComponentRenderProps) {
  const {
    label = "",
    options = [],
    placeholder = "",
    required = false,
    disabled = false,
    valuePath = "",
  } = element.props as SelectProps;
  const [value, setValue] = useDataBinding(String(valuePath));

  const normalizedOptions: SelectOption[] = options
    .map((opt) => {
      if (typeof opt === "string") return { value: opt, label: opt };
      return {
        value: String(opt.value || ""),
        label: String(opt.label || opt.value || ""),
      };
    })
    .filter((opt) => opt.value !== ""); // Filter out empty values

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <ShadcnSelect
        value={String(value || "")}
        disabled={disabled}
        onValueChange={setValue}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((opt, idx) => (
            <SelectItem key={idx} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
    </div>
  );
}

// Table Component

export function Table({ element }: ComponentRenderProps) {
  const {
    columns = [],
    dataPath = "",
    data: staticData,
    filters = [],
  } = element.props as TableProps;
  const dynamicData = useDataValue(String(dataPath));
  const rawData = (dataPath ? dynamicData : staticData) as
    | Array<Record<string, unknown>>
    | undefined;

  // Filter state
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4">No data available</div>
    );
  }

  // If no columns specified, infer from first data row
  const displayColumns: TableColumn[] =
    columns.length > 0
      ? columns
      : Object.keys(rawData[0]).map((key) => ({ header: key, key }));

  // Apply filters
  const tableData = useMemo(() => {
    if (filters.length === 0 || Object.keys(filterValues).length === 0) {
      return rawData;
    }

    return rawData.filter((row) => {
      return filters.every((filter) => {
        const filterValue = filterValues[filter.column];
        if (!filterValue || filterValue === "__all__") return true;

        const cellValue = String(row[filter.column] ?? "").toLowerCase();
        const searchValue = filterValue.toLowerCase();

        if (filter.type === "number") {
          const numCell = parseFloat(String(row[filter.column] ?? "0"));
          const numFilter = parseFloat(filterValue);
          return !isNaN(numFilter) && numCell >= numFilter;
        }

        return cellValue.includes(searchValue);
      });
    });
  }, [rawData, filters, filterValues]);

  return (
    <div className="space-y-3">
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter, idx) => {
            if (filter.type === "select" && filter.options) {
              return (
                <ShadcnSelect
                  key={idx}
                  value={filterValues[filter.column] || ""}
                  onValueChange={(val) =>
                    setFilterValues({ ...filterValues, [filter.column]: val })
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue
                      placeholder={
                        filter.placeholder || `Filter ${filter.column}`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {filter.options.map((opt, i) => (
                      <SelectItem key={i} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </ShadcnSelect>
              );
            }

            return (
              <ShadcnInput
                key={idx}
                type={filter.type === "number" ? "number" : "text"}
                placeholder={filter.placeholder || `Filter ${filter.column}`}
                value={filterValues[filter.column] || ""}
                onChange={(e) =>
                  setFilterValues({
                    ...filterValues,
                    [filter.column]: e.target.value,
                  })
                }
                className="w-[180px]"
              />
            );
          })}
          {Object.keys(filterValues).length > 0 && (
            <ShadcnButton variant="outline" onClick={() => setFilterValues({})}>
              Clear
            </ShadcnButton>
          )}
        </div>
      )}

      <ShadcnTable>
        <TableHeader>
          <TableRow>
            {displayColumns.map((col, idx) => (
              <TableHead
                key={idx}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {displayColumns.map((col, colIdx) => (
                <TableCell key={colIdx}>{String(row[col.key] ?? "")}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </ShadcnTable>
    </div>
  );
}

// Action Components

export function Button({ element, onAction }: ComponentRenderProps) {
  const {
    label = "",
    action,
    variant = "primary",
    disabled = false,
    icon = "",
  } = element.props as ButtonProps;
  const variantMap: Record<
    string,
    "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  > = {
    primary: "default",
    secondary: "secondary",
    danger: "destructive",
    outline: "outline",
  };

  return (
    <ShadcnButton
      variant={variantMap[variant] || "default"}
      disabled={disabled}
      onClick={() => !disabled && onAction && action && onAction(action)}
    >
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
    </ShadcnButton>
  );
}

// Export Registry

export const componentRegistry: ComponentRegistry = {
  Card,
  Stack,
  Grid,
  Table,
  Text,
  Metric,
  Badge,
  Alert,
  Input,
  Checkbox: CheckboxField,
  TextArea,
  Select: SelectField,
  Button,
};
