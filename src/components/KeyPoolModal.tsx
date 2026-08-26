import React, { useState } from 'react';
import { apiKeyPool, KeyStatus } from '../services/apiPool';
import { X, Key, Plus, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface KeyPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyPoolModal: React.FC<KeyPoolModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState<KeyStatus[]>(apiKeyPool.getPoolStats());
  const [newKeyInput, setNewKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const refreshKeys = () => setKeys(apiKeyPool.getPoolStats());

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyInput.trim().startsWith('gsk_')) {
      setErrorMsg('Groq API Key must start with gsk_');
      return;
    }
    const success = apiKeyPool.addKey(newKeyInput.trim());
    if (success) {
      setNewKeyInput('');
      setErrorMsg('');
      refreshKeys();
    } else {
      setErrorMsg('Key already exists in pool.');
    }
  };

  const handleRemoveKey = (keyId: string) => {
    const success = apiKeyPool.removeKey(keyId);
    if (success) {
      refreshKeys();
    } else {
      setErrorMsg('Minimum 1 key required in pool.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0a0a0a] border border-[#262626] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#141414]">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-white" />
            <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">
              GROQ API KEY LOAD BALANCER POOL
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#262626] text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <p className="text-xs text-neutral-400 font-sans">
            ALVO load balances round-robin across all active Groq API keys to eliminate rate limits during 150-AI debates.
          </p>

          {/* Add Key Input Form */}
          <form onSubmit={handleAddKey} className="flex gap-2">
            <input
              type="text"
              value={newKeyInput}
              onChange={(e) => setNewKeyInput(e.target.value)}
              placeholder="Add another Groq API Key (gsk_...)"
              className="flex-1 bg-[#141414] border border-[#262626] focus:border-white rounded-xl px-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition"
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
                className="flex items-center justify-between p-3 rounded-xl bg-[#141414] border border-[#262626]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-neutral-500">#{idx + 1}</span>
                  <div>
                    <span className="text-xs font-mono font-semibold text-neutral-200">{k.maskedKey}</span>
                    <div className="flex items-center gap-3 text-[10px] text-neutral-400 font-mono mt-0.5">
                      <span>Reqs: <strong className="text-white">{k.requestCount}</strong></span>
                      <span>Avg Latency: <strong className="text-neutral-300">{k.avgLatencyMs > 0 ? `${k.avgLatencyMs}ms` : '-'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Action */}
                <div className="flex items-center gap-3">
                  {k.status === 'active' ? (
                    <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#1f1f1f] text-white border border-[#333333] font-mono">
                      <ShieldCheck className="w-3 h-3 text-white" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[#1f1f1f] text-neutral-400 border border-[#333333] font-mono">
                      <AlertTriangle className="w-3 h-3 text-neutral-400" /> Rate Limited
                    </span>
                  )}

                  <button
                    onClick={() => handleRemoveKey(k.id)}
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition"
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
        <div className="px-6 py-3 bg-[#141414] border-t border-[#262626] flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Total Pool Capacity: {keys.length * 100000} TPM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-neutral-200 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
