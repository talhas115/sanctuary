import React from 'react';
import { Lock, Tag } from 'lucide-react';
import { decryptContent } from '../utils/crypto';

const EntryCard = ({ entry, onClick }) => {
  const isEncrypted = entry.isEncrypted;
  const rawContent = isEncrypted ? decryptContent(entry.content) : entry.content;
  const plainText = rawContent?.replace(/<[^>]+>/g, '') || '';
  const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  return (
    <div 
      onClick={onClick}
      className="bg-white p-[16px] rounded-[16px] border border-outline/50 shadow-subtle hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer transition-all group flex flex-col"
    >
      <div className="flex justify-between items-start mb-1">
        <span className="text-[12px] text-on-surface-variant font-medium">
          {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        {isEncrypted && <Lock className="w-3.5 h-3.5 text-primary/60" />}
      </div>

      <h3 className="text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-1">
        {entry.title || 'Untitled Entry'}
      </h3>

      <p className="text-sm text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">
        {plainText || 'No content.'}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {entry.tags?.length > 0 && entry.tags.slice(0, 3).map((tag, idx) => {
             const tagName = typeof tag === 'object' ? tag.name : tag;
             return (
               <span key={idx} className="bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase">
                 {tagName}
               </span>
             );
          })}
        </div>
        <span className="text-[11px] font-semibold text-on-surface-variant/70 uppercase tracking-wide">
          {wordCount} WORDS
        </span>
      </div>
    </div>
  );
};

export default EntryCard;
