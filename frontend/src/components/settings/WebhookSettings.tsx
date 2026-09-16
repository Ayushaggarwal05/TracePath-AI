import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Copy, Check, ShieldCheck, Globe } from 'lucide-react';

export const WebhookSettings: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const webhookUrl = `${window.location.origin}/api/v1/github/webhooks`;

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-brand-400" />
        <h3 className="text-base font-semibold text-slate-100">GitHub Webhook Integration</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        TracePath AI automatically listens for code push events and pull requests on your repositories.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Payload Webhook URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-3.5 py-2 bg-slate-950 border border-dark-border rounded-lg text-xs font-mono text-slate-300 select-all focus:outline-none"
            />
            <Button size="sm" variant="secondary" onClick={handleCopy} leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}>
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-dark-border flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h5 className="font-semibold text-slate-200">HMAC-SHA256 Signature Verification</h5>
            <p className="text-slate-400 mt-0.5">
              All incoming webhooks are strictly validated using your configured <code>GITHUB_WEBHOOK_SECRET</code>.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
