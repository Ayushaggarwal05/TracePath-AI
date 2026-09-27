import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Copy, Check, ShieldCheck, Globe, HelpCircle } from 'lucide-react';

export const WebhookSettings: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const webhookUrl = `${window.location.origin}/api/v1/github/webhooks`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 space-y-6">
      {/* Header & Plain English Explanation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-[#0F2742] dark:text-slate-100 font-sans">
            Real-Time GitHub Webhook Integration
          </h3>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          A webhook is a secure, instant notification sent by GitHub whenever code is pushed. It tells TracePath to immediately inspect the new commits and keep your documentation up to date.
        </p>
      </div>

      {/* Webhook Payload URL Box */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
          Your Webhook URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={webhookUrl}
            className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 select-all focus:outline-none shadow-2xs"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy URL'}
          </Button>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
          TracePath automatically configures this when you activate a repository, but you can copy it manually if setting up a custom webhook.
        </p>
      </div>

      {/* 3-Step Setup Guide */}
      <div className="p-4 rounded-2xl bg-[#F7F5F0] dark:bg-slate-900/60 border border-stone-200/90 dark:border-slate-800 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 font-sans">
          <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>How to add this to GitHub in 3 simple steps:</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold font-mono text-indigo-700 dark:text-brand-400 block">Step 1</span>
            <p className="text-slate-700 dark:text-slate-300">Open your GitHub repository and click <strong>Settings &gt; Webhooks &gt; Add webhook</strong>.</p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold font-mono text-indigo-700 dark:text-brand-400 block">Step 2</span>
            <p className="text-slate-700 dark:text-slate-300">Paste your URL above into the <strong>Payload URL</strong> field and choose <strong>application/json</strong>.</p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-stone-200/80 dark:border-slate-800 space-y-1">
            <span className="text-[11px] font-bold font-mono text-emerald-700 dark:text-emerald-400 block">Step 3</span>
            <p className="text-slate-700 dark:text-slate-300">Select <strong>Just the push event</strong> and click <strong>Add webhook</strong>. You're all set!</p>
          </div>
        </div>
      </div>

      {/* Security Verification */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-500/30 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 font-sans">
          <h5 className="font-bold text-slate-900 dark:text-slate-100">Tamper-Proof HMAC-SHA256 Verification</h5>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            TracePath verifies every incoming notification with a cryptographic signature so only genuine commits from your authorized GitHub repositories can trigger doc syncs.
          </p>
        </div>
      </div>
    </Card>
  );
};
