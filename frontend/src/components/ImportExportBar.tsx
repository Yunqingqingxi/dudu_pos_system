import { useRef } from "react";
import { Download, Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiBase } from "@/api/client";

interface ImportExportBarProps {
  type: "products" | "orders";
  onImportDone: () => void;
  importLabel?: string;
}

export function ImportExportBar({ type, onImportDone, importLabel }: ImportExportBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = (fmt: "csv" | "xlsx") => {
    const url = `${apiBase}/export/${type}?fmt=${fmt}`;
    window.open(url, "_blank");
  };

  const handleExportDb = () => {
    window.open(`${apiBase}/export/database`, "_blank");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(`${apiBase}/import/${type}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        onImportDone();
      } else {
        alert(data.detail || "导入失败");
      }
    } catch {
      alert("导入失败，请检查网络连接");
    }

    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      {/* Import */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mr-1 h-4 w-4" />
        {importLabel || "导入"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx"
        className="hidden"
        onChange={handleImport}
      />

      {/* Export */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-1 h-4 w-4" />
            导出
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-44 p-2" align="end">
          <div className="space-y-1">
            <button
              className="w-full rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent"
              onClick={() => handleExport("csv")}
            >
              导出 CSV
            </button>
            <button
              className="w-full rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent"
              onClick={() => handleExport("xlsx")}
            >
              导出 Excel
            </button>
            <div className="border-t my-1" />
            <button
              className="w-full rounded-sm px-2 py-1.5 text-sm text-left hover:bg-accent flex items-center gap-1"
              onClick={handleExportDb}
            >
              <Database className="h-3.5 w-3.5" />
              导出数据库 (.db)
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
