import React from 'react';
import { ConsensusReport } from '../services/debateEngine';
import { Award, Download, FileText, CheckCircle2, ShieldAlert, Sparkles, Scale, Filter } from 'lucide-react';

interface ConsensusReportViewProps {
  report: ConsensusReport;
}

export const ConsensusReportView: React.FC<ConsensusReportViewProps> = ({ report }) => {
  const exportMarkdown = () => {
    const mdContent = `# ALVO 2.0 Research & Consensus Masterplan Report

**Topic:** ${report.topic}  
**Participating Council:** ${report.participatingCount} AI Personas Across All Societal Spheres  
**Consensus Score:** ${report.consensusScore}%  
**Winning Kubu Alliance:** ${report.refereeEvaluation?.winningKubu || 'Kubu Health & Law Alliance'}

---

## Referee AI (Wasit AI) Evaluation & Filtering
**Reasoning:** ${report.refereeEvaluation?.reasoning}  
**Filtered Out Arguments:**  
${report.refereeEvaluation?.filteredOutArguments.map(a => `- ${a}`).join('\n')}

---

## Executive Summary
${report.executiveSummary}

---

## Key Consensus Agreements
${report.coreAgreements.map(a => `- ${a}`).join('\n')}

---

## Primary Friction Points & Divergences
${report.majorFrictionPoints.map(f => `- ${f}`).join('\n')}

---

## Risk & Mitigation Matrix
| Risk Factor | Severity | Strategic Mitigation |
|---|---|---|
${report.riskMatrix.map(r => `| ${r.risk} | ${r.severity} | ${r.mitigation} |`).join('\n')}

---

## Final Strategic Verdict
${report.finalVerdict}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALVO_Report_${Date.now()}.md`;
    a.click();
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ALVO_Report_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-2xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#0a0a0a] border border-[#262626] text-white">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white font-mono uppercase tracking-wider">
              SYNTHESIZED CONSENSUS & REFEREE VERDICT
            </h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Topic: "{report.topic}" • Council: {report.participatingCount} AI Debaters
            </p>
          </div>
        </div>

        {/* Score Badge & Download Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0a0a0a] border border-[#262626] text-neutral-200 font-mono text-xs">
            <span className="text-neutral-400">Consensus:</span>
            <span className="text-sm font-bold text-white">{report.consensusScore}%</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-200 border border-white text-xs font-bold text-black transition"
              title="Export Markdown"
            >
              <FileText className="w-3.5 h-3.5 text-black" /> Export .MD
            </button>
            <button
              onClick={exportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] border border-[#262626] text-xs font-medium text-neutral-200 hover:text-white transition"
              title="Export JSON"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" /> Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* WASIT AI (REFEREE EVALUATION) CARD */}
      <div className="bg-[#0a0a0a] border border-[#333333] p-5 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
            <Scale className="w-4 h-4 text-white" /> Referee AI (Wasit AI) Filter & Kubu Winner
          </h4>
          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-[#1c1c1c] text-white border border-[#333333]">
            Winning Alliance: {report.refereeEvaluation?.winningKubu || 'Kubu Health & Law'}
          </span>
        </div>

        <p className="text-xs text-neutral-200 leading-relaxed font-sans">
          <strong>Referee Reasoning:</strong> {report.refereeEvaluation?.reasoning}
        </p>

        {report.refereeEvaluation?.filteredOutArguments && report.refereeEvaluation.filteredOutArguments.length > 0 && (
          <div className="pt-2 border-t border-[#262626] text-xs space-y-1">
            <span className="font-mono text-neutral-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400" /> Filtered Out / Rejected Arguments:
            </span>
            <ul className="list-disc list-inside text-neutral-400 font-sans pl-2">
              {report.refereeEvaluation.filteredOutArguments.map((arg, idx) => (
                <li key={idx}>{arg}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#262626]">
        <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-1.5">
          Executive Summary
        </h4>
        <p className="text-xs text-neutral-200 leading-relaxed font-sans">
          {report.executiveSummary}
        </p>
      </div>

      {/* Core Agreements & Friction Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Core Agreements */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-4 rounded-xl">
          <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-300" /> Key Consensus Agreements
          </h4>
          <ul className="space-y-2">
            {report.coreAgreements.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed font-sans">
                <span className="text-white font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Friction Points */}
        <div className="bg-[#0a0a0a] border border-[#262626] p-4 rounded-xl">
          <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4 text-neutral-300" /> Primary Friction Points & Divergences
          </h4>
          <ul className="space-y-2">
            {report.majorFrictionPoints.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed font-sans">
                <span className="text-white font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Risk & Mitigation Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
          Risk & Mitigation Matrix
        </h4>
        <div className="border border-[#262626] rounded-xl overflow-hidden bg-[#0a0a0a]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#141414] border-b border-[#262626] text-neutral-400 font-mono">
                <th className="p-3">Risk Factor</th>
                <th className="p-3 w-28">Severity</th>
                <th className="p-3">Strategic Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {report.riskMatrix.map((r, idx) => (
                <tr key={idx} className="hover:bg-[#141414] transition">
                  <td className="p-3 font-semibold text-neutral-200">{r.risk}</td>
                  <td className="p-3 font-mono text-[10px] text-neutral-300">{r.severity}</td>
                  <td className="p-3 text-neutral-300">{r.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Final Strategic Verdict */}
      <div className="bg-[#0a0a0a] border border-[#333333] p-4.5 rounded-xl">
        <h4 className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase tracking-wider mb-1.5">
          <Sparkles className="w-4 h-4 text-white" /> Final Strategic Verdict & Recommendation
        </h4>
        <p className="text-xs font-medium text-neutral-200 leading-relaxed font-sans">
          {report.finalVerdict}
        </p>
      </div>

    </div>
  );
};
