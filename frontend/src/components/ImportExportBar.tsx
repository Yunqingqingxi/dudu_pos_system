import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { useDialog } from "@/components/dialogs/DialogProvider";
import { Button } from "@/components/ui/button";
import { apiBase } from "@/api/client";

interface ImportExportBarProps {
  type: "products" | "orders";
  onImportDone: () => void;
  importLabel?: string;
}

export function ImportExportBar({ type, onImportDone, importLabel }: ImportExportBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dialog = useDialog();

  const handleExport = () => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = `${apiBase}/export/${type}?fmt=xlsx`;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 5000);
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
        dialog.alert("导入成功", data.message);
        onImportDone();
      } else {
        dialog.alert("导入失败", data.detail || "导入失败");
      }
    } catch {
      dialog.alert("导入失败", "请检查网络连接");
    }

    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-2">
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

      <Button variant="outline" size="sm" onClick={handleExport}>
        <Download className="mr-1 h-4 w-4" />
        导出 Excel
      </Button>
    </div>
  );
}