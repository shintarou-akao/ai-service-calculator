// src/components/AiServiceComparison/components/ShareDialog/ShareDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type ShareDialogProps = {
  url: string | null;
  onClose: () => void;
};

export default function ShareDialog({ url, onClose }: ShareDialogProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast({
        title: "URLをコピーしました",
        description: "共有URLがクリップボードにコピーされました。",
      });
    }
  };

  if (!url) return null;

  return (
    <Dialog open={!!url} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>共有URL</DialogTitle>
          <DialogDescription>
            以下のURLをコピーして、現在の選択状態を他の人と共有できます。
          </DialogDescription>
        </DialogHeader>
        <Input value={url} readOnly className="mb-4" />
        <DialogFooter>
          <Button onClick={handleCopy}>URLをコピー</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
