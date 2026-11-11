import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminDatabaseOverview, useAdminDatabaseTableRows } from "@/lib/data-client";
import {
  ChevronLeft,
  ChevronRight,
  Columns3,
  Database,
  RefreshCw,
  Search,
  ShieldAlert,
  Table2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/admin/database")({
  component: AdminDatabasePage,
  head: () => ({
    meta: [{ title: "Database Tables Inspector — PAGE Admin" }],
  }),
});

function formatCellPreview(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "object") {
    const json = JSON.stringify(value);
    return json.length > 90 ? `${json.slice(0, 90)}…` : json;
  }
  const str = String(value);
  return str.length > 90 ? `${str.slice(0, 90)}…` : str;
}

export function AdminDatabasePage() {
  const overviewQuery = useAdminDatabaseOverview();
  const [selectedTable, setSelectedTable] = useState<string>("products");
  const [tableSearch, setTableSearch] = useState("");
  const [showSchema, setShowSchema] = useState(true);
  const [offset, setOffset] = useState(0);
  const [inspectedCell, setInspectedCell] = useState<{
    column: string;
    value: unknown;
  } | null>(null);

  const pageSize = 50;

  const tables = useMemo(() => overviewQuery.data?.tables ?? [], [overviewQuery.data?.tables]);
  const filteredTables = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    if (!q) return tables;
    return tables.filter((t) => t.name.toLowerCase().includes(q));
  }, [tables, tableSearch]);

  const activeTableMeta = useMemo(
    () => tables.find((t) => t.name === selectedTable) ?? tables[0],
    [tables, selectedTable],
  );

  const effectiveTableName = activeTableMeta?.name ?? selectedTable;
  const rowsQuery = useAdminDatabaseTableRows(
    effectiveTableName,
    pageSize,
    offset,
    Boolean(effectiveTableName),
  );

  const totalDbRows = useMemo(() => tables.reduce((sum, t) => sum + t.rowCount, 0), [tables]);

  const handleSelectTable = (name: string) => {
    setSelectedTable(name);
    setOffset(0);
  };

  const handleRefresh = () => {
    overviewQuery.refetch();
    rowsQuery.refetch();
  };

  const rowsData = rowsQuery.data;
  const currentStart = rowsData && rowsData.totalRows > 0 ? offset + 1 : 0;
  const currentEnd = rowsData ? Math.min(offset + rowsData.rows.length, rowsData.totalRows) : 0;
  const hasPrev = offset > 0;
  const hasNext = rowsData ? offset + pageSize < rowsData.totalRows : false;

  return (
    <AdminLayout activeRoute="/admin/database">
      <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                <span>Database Tables Inspector</span>
              </h1>
              {overviewQuery.data && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {overviewQuery.data.engine}
                </span>
              )}
            </div>
            <p className="text-[13px] text-zinc-500 mt-1">
              Live read-only browser across all {tables.length || 16} Drizzle PostgreSQL/PGlite
              tables ({totalDbRows} total rows).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowSchema((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                showSchema
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-white/[0.08] bg-[#232323] text-zinc-300 hover:text-white"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" />
              <span>{showSchema ? "Hide Columns" : "Show Columns"}</span>
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-[#232323] hover:bg-[#2a2a2a] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${
                  overviewQuery.isFetching || rowsQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {overviewQuery.isLoading ? (
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="h-96 bg-[#232323] border border-white/[0.06] rounded-xl animate-pulse" />
            <div className="h-96 bg-[#232323] border border-white/[0.06] rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[265px_1fr] items-start">
            {/* Table Sidebar List */}
            <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="p-3 border-b border-white/[0.06]">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Find table..."
                    aria-label="Filter database table list"
                    className="w-full bg-[#181818] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto lg:max-h-[78vh]">
                {filteredTables.map((tbl) => {
                  const active = tbl.name === effectiveTableName;
                  return (
                    <button
                      key={tbl.name}
                      type="button"
                      onClick={() => handleSelectTable(tbl.name)}
                      className={`flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-mono transition-colors shrink-0 cursor-pointer ${
                        active
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : "text-zinc-300 hover:bg-white/[0.04] hover:text-white border border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <Table2
                          className={`h-3.5 w-3.5 shrink-0 ${
                            active ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        />
                        <span className="truncate font-semibold">{tbl.name}</span>
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums shrink-0 ${
                          active
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-white/[0.06] text-zinc-400"
                        }`}
                      >
                        {tbl.rowCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Table Schema & Rows Panel */}
            <div className="min-w-0 space-y-4">
              {/* Schema Columns Strip */}
              {showSchema && activeTableMeta && (
                <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-zinc-300">
                      Schema: <span className="text-emerald-400">{activeTableMeta.name}</span> (
                      {activeTableMeta.columns.length} columns)
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {activeTableMeta.rowCount} total rows
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeTableMeta.columns.map((col) => (
                      <span
                        key={col.name}
                        className="inline-flex items-center gap-1 rounded-md border border-white/[0.07] bg-[#1a1a1a] px-2 py-1 text-[11px] font-mono"
                      >
                        <span className="text-zinc-200 font-semibold">{col.name}</span>
                        <span className="text-zinc-500">:</span>
                        <span className="text-emerald-400/90">{col.dataType}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Redaction Notice */}
              {rowsData?.hasRedactedFields && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    Sensitive security columns (<code>password_hash</code>, session{" "}
                    <code>token</code>, and <code>token_hash</code>) are automatically redacted
                    server-side.
                  </span>
                </div>
              )}

              {/* Table Rows Grid */}
              <div className="bg-[#232323] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-bold text-white">{effectiveTableName}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-400">
                      {rowsData
                        ? rowsData.totalRows === 0
                          ? "0 rows"
                          : `Showing ${currentStart}–${currentEnd} of ${rowsData.totalRows}`
                        : "Loading…"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={!hasPrev}
                      onClick={() => setOffset((v) => Math.max(0, v - pageSize))}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={!hasNext}
                      onClick={() => setOffset((v) => v + pageSize)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#1a1a1a] px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                    >
                      Next
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {rowsQuery.isLoading ? (
                  <div className="p-8 text-center text-xs text-zinc-500">Loading table rows...</div>
                ) : rowsData && rowsData.rows.length > 0 ? (
                  <div className="overflow-x-auto max-h-[65vh]">
                    <table
                      data-testid="admin-db-rows-table"
                      className="w-full text-left text-xs border-collapse"
                    >
                      <thead className="sticky top-0 z-10 bg-[#1a1a1a] border-b border-white/[0.08] font-mono text-[11px] text-zinc-400">
                        <tr>
                          <th className="px-3 py-2.5 text-center w-10 border-r border-white/[0.04]">
                            #
                          </th>
                          {rowsData.columns.map((col) => (
                            <th
                              key={col.name}
                              className="px-3 py-2.5 font-semibold whitespace-nowrap border-r border-white/[0.04]"
                            >
                              {col.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04] font-mono text-[11.5px]">
                        {rowsData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                            <td className="px-3 py-2.5 text-center text-zinc-600 border-r border-white/[0.04] tabular-nums">
                              {offset + idx + 1}
                            </td>
                            {rowsData.columns.map((col) => {
                              const val = row[col.name];
                              const preview = formatCellPreview(val);
                              const isNull = val === null || val === undefined;
                              const isRedacted = preview === "[REDACTED]";
                              return (
                                <td
                                  key={col.name}
                                  className="px-3 py-2.5 max-w-[260px] truncate border-r border-white/[0.04] align-top"
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setInspectedCell({ column: col.name, value: val })
                                    }
                                    title="Click to inspect full cell value"
                                    className={`text-left truncate block w-full hover:underline cursor-pointer ${
                                      isNull
                                        ? "text-zinc-600 italic"
                                        : isRedacted
                                          ? "text-amber-400 font-semibold"
                                          : typeof val === "boolean"
                                            ? val
                                              ? "text-emerald-400"
                                              : "text-rose-400"
                                            : "text-zinc-200"
                                    }`}
                                  >
                                    {preview}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-10 text-center text-xs text-zinc-500">
                    Table <code className="font-mono text-zinc-300">{effectiveTableName}</code>{" "}
                    currently has 0 rows.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cell Full Value / JSONB Inspector Modal */}
      {inspectedCell && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectedCell(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1e1e1e] text-zinc-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#181818]">
              <span className="font-mono text-xs font-bold text-emerald-400">
                {effectiveTableName}.{inspectedCell.column}
              </span>
              <button
                type="button"
                onClick={() => setInspectedCell(null)}
                aria-label="Close cell inspector"
                className="p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-200 max-h-[65vh] overflow-auto whitespace-pre-wrap break-words">
              {inspectedCell.value === null || inspectedCell.value === undefined
                ? "NULL"
                : typeof inspectedCell.value === "object"
                  ? JSON.stringify(inspectedCell.value, null, 2)
                  : String(inspectedCell.value)}
            </pre>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
