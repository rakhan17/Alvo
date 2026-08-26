import React, { useRef, useEffect } from 'react';
import { StoryChapter } from '../types/game';
import { Feather, Compass, Sparkles } from 'lucide-react';

interface NarrativeCanvasProps {
  chapters: StoryChapter[];
  isGenerating: boolean;
}

export const NarrativeCanvas: React.FC<NarrativeCanvasProps> = ({
  chapters,
  isGenerating
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chapters]);

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 overflow-y-auto custom-scrollbar select-text">
      
      {chapters.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#8e8d99] font-serif space-y-4">
          <Feather className="w-8 h-8 text-[#c9b897] opacity-60" />
          <p className="text-sm italic">
            The parchment is blank. Begin a new chronicle to forge your story.
          </p>
        </div>
      ) : (
        <div className="space-y-12 pb-16">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="space-y-6 animate-in fade-in duration-300">
              
              {/* Chapter Header Divider */}
              <div className="flex items-center gap-4 py-2 border-b border-[#242429]">
                <span className="text-[11px] font-mono text-[#c9b897] uppercase tracking-widest font-bold">
                  CHAPTER {chapter.chapterNumber}
                </span>
                <div className="flex-1 h-px bg-[#242429]" />
                <span className="text-[11px] font-mono text-[#8e8d99]">
                  {new Date(chapter.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Novel Narrative Text */}
              <div className="font-serif text-[#e6e1d5] text-base md:text-lg leading-[1.85] tracking-wide whitespace-pre-wrap selection:bg-[#c9b897] selection:text-black">
                {chapter.narrativeText}
                {chapter.isStreaming && (
                  <span className="inline-block w-2 h-5 ml-1 bg-[#c9b897] animate-pulse align-middle" />
                )}
              </div>

              {/* Player Choice Quote Box if present */}
              {chapter.actionTaken && (
                <div className="mt-4 p-4 rounded-xl bg-[#141417] border-l-2 border-[#c9b897] text-xs font-sans text-[#a8a7b5] italic flex items-center gap-3 shadow-inner">
                  <Compass className="w-4 h-4 text-[#c9b897] shrink-0" />
                  <span>Your Action: "{chapter.actionTaken}"</span>
                </div>
              )}

            </article>
          ))}
          <div ref={scrollRef} />
        </div>
      )}

    </div>
  );
};
