"use client";
import { useState } from "react";

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Po známosti", text: "Pridaj sa do mojej siete:", url });
        return;
      } catch {
        /* používateľ zdieľanie zrušil, skopírujeme */
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button type="button" onClick={copy} className="btn-secondary">
      {copied ? "Skopírované" : "Poslať odkaz"}
    </button>
  );
}
