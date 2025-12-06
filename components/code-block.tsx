"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
}

export function CodeBlock({ code, language = "typescript", title, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative rounded-lg border border-white/10 bg-black/60 backdrop-blur-sm", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-xs text-muted-foreground/60">{language}</span>
        </div>
      )}
      <div className="relative">
        <Button
          size="sm"
          variant="ghost"
          className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-white/10"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <pre className="overflow-x-auto p-4 pr-12">
          <code className="text-sm text-white/90">{code}</code>
        </pre>
      </div>
    </div>
  );
}
