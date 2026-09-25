'use client';

import React from 'react';
import { Bot, User, AlertCircle } from 'lucide-react';
import SchemeRecommendationCard, { SchemeRecommendation } from './SchemeRecommendationCard';
import QuickReplyChips from './QuickReplyChips';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  quick_replies?: string[];
  matched_schemes?: SchemeRecommendation[];
  timestamp?: string;
  isError?: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
  onQuickReplySelect?: (reply: string) => void;
  language?: string;
}

export default function MessageBubble({
  message,
  onQuickReplySelect,
  language = 'en',
}: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  // Format simple markdown (bold, lists, code, links) cleanly without heavy deps
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h5 key={idx} className="font-bold text-slate-100 text-sm mt-2 mb-1">
            {line.replace('### ', '')}
          </h5>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h4 key={idx} className="font-bold text-white text-base mt-2 mb-1">
            {line.replace('## ', '')}
          </h4>
        );
      }
      // List items
      if (line.trim().startsWith('• ') || line.trim().startsWith('- ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-200 my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
          </li>
        );
      }
      // Horizontal rules
      if (line.trim() === '---') {
        return <hr key={idx} className="border-slate-800 my-2" />;
      }
      // Empty line spacing
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Normal paragraph
      return (
        <p
          key={idx}
          className="text-xs leading-relaxed my-0.5"
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }}
        />
      );
    });
  };

  const formatInlineMarkdown = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-950 px-1 py-0.5 rounded text-[11px] font-mono text-brand-300">$1</code>');
  };

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-full text-[11px]">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          {message.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col my-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-start gap-2.5 max-w-[88%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
            isUser ? 'bg-slate-700 text-slate-200' : 'bg-brand-600 text-white'
          }`}
        >
          {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
        </div>

        {/* Message Content Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm text-xs leading-relaxed ${
            isUser
              ? 'bg-brand-600 text-white rounded-tr-none font-medium'
              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
          }`}
        >
          {renderFormattedText(message.text)}
        </div>
      </div>

      {/* Matched Scheme Cards */}
      {message.matched_schemes && message.matched_schemes.length > 0 && (
        <div className="w-full max-w-[95%] md:max-w-[88%] pl-9 my-2 space-y-2 animate-fade-in">
          {message.matched_schemes.map((scheme, idx) => (
            <SchemeRecommendationCard
              key={scheme.scheme_id || idx}
              scheme={scheme}
              rank={idx + 1}
              language={language}
            />
          ))}
        </div>
      )}

      {/* Quick Reply Chips attached to assistant message */}
      {!isUser && message.quick_replies && message.quick_replies.length > 0 && onQuickReplySelect && (
        <QuickReplyChips
          chips={message.quick_replies}
          onSelect={onQuickReplySelect}
        />
      )}
    </div>
  );
}
