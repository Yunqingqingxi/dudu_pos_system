import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Check } from "lucide-react";

type DialogOptions = {
  title: string;
  message: string;
  type?: "info" | "warning" | "success";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type DialogContextType = {
  alert: (title: string, message: string) => void;
  confirm: (title: string, message: string) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<DialogOptions>({ title: "", message: "" });
  const [resolveRef, setResolveRef] = useState<((v: boolean) => void) | null>(null);

  const alert = useCallback((title: string, message: string) => {
    setOpts({ title, message, type: "info", confirmLabel: "确定" });
    setOpen(true);
    setResolveRef(null);
  }, []);

  const confirm = useCallback((title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setOpts({ title, message, type: "warning", confirmLabel: "确定", cancelLabel: "取消" });
      setResolveRef(() => resolve);
      setOpen(true);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setOpen(false);
    resolveRef?.(true);
    setResolveRef(null);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    setOpen(false);
    resolveRef?.(false);
    setResolveRef(null);
  }, [resolveRef]);

  const icon = opts.type === "warning"
    ? <AlertTriangle className="h-6 w-6 text-amber-500" />
    : opts.type === "success"
    ? <Check className="h-6 w-6 text-green-500" />
    : <Info className="h-6 w-6 text-blue-500" />;

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      <Dialog open={open} onOpenChange={(v) => { if (!v) handleCancel(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {icon}
              <DialogTitle>{opts.title}</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-base">
              {opts.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            {opts.cancelLabel && (
              <DialogClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  {opts.cancelLabel}
                </Button>
              </DialogClose>
            )}
            <Button onClick={handleConfirm}>
              {opts.confirmLabel || "确定"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
}