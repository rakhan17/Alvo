import React, { useState } from 'react';
import { apiKeyPool, KeyStatus } from '../services/apiPool';
import { X, Key, Plus, Trash2, ShieldCheck, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

interface KeyPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyPoolModal: React.FC<KeyPoolModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<KeyStatus[]>(apiKeyPool.getPoolStats());
  const [newKeyInput, setNewKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const refreshKeys = () => {
    setKeys(apiKeyPool.getPoolStats());
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInput.trim()) return;

    const success = apiKeyPool.addKey(newKeyInput.trim());
    if (success) {
      setNewKeyInput('');
      setErrorMsg('');
      refreshKeys();
    } else {
      setErrorMsg('Key already exists or is invalid.');
    }
  };

  const handleRemoveKey = (id: string) => {
    const success = apiKeyPool.removeKey(id);
    if (success) {
      refreshKeys();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#090b10] border border-cyber-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyber-border bg-cyber-card/60">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-white font-sans">
              GROQ API KEY LOAD BALANCER POOL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-cyber-border/40 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <p className="text-xs text-gray-400">
            ALVO rotates requests round-robin across all active Groq API keys to eliminate rate limits during 50-AI debates.
          </p>

          {/* Add Key Input Form */}
          <form onSubmit={handleAddKey} className="flex gap-2">
            <input
              type="text"
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              placeholder="Add another Groq API Key (gsk_...)"
              className="flex-1 bg-[#0f1420] border border-cyber-border focus:border-emerald-400 rounded-xl px-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" /> Add Key
            </button>
          </form>

          {errorMsg && (
            <p className="text-xs text-rose-400 font-mono">{errorMsg}</p>
          )}

          {/* Key Table List */}
          <div className="space-y-2 pt-2">
            {keys.map((k, idx) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3 rounded-xl bg-cyber-card/70 border border-cyber-border/80 hover:border-cyber-border transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-gray-500">#{idx + 1}</span>
                  <div>
                    <span className="text-xs font-mono font-semibold text-gray-200">{k.maskedKey}</span>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-mono mt-0.5">
                      <span>Reqs: <strong className="text-cyan-300">{k.requestCount}</strong></span>
                      <span>Avg Latency: <strong className="text-emerald-300">{k.avgLatencyMs > 0 ? `${k.avgLatencyMs}ms` : '-'}</strong></span>
                      {k.errorCount > 0 && <span className="text-rose-400">Errors: {k.errorCount}</span>}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Action */}
                <div className="flex items-center gap-3">
                  {k.status === 'active' ? (
                    <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                      <ShieldCheck className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
                      <AlertTriangle className="w-3 h-3" /> Rate Limited
                    </span>
                  )}

                  <button
                    onClick={() => handleRemoveKey(k.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 transition"
                    title="Remove Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-cyber-card/60 border-t border-cyber-border flex items-center justify-between text-xs text-gray-400 font-mono">
          <span>Total Pool Capacity: {keys.length * 100000} TPM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyber-border hover:bg-cyber-border/80 text-gray-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
