import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { useEventStore, EventTemplate } from '../stores/eventStore';

interface TemplateShortcutsProps {
  onTemplateSelect: (template: EventTemplate) => void;
  day: Date;
}

function TemplateShortcuts({ onTemplateSelect, day }: TemplateShortcutsProps) {
  const templates = useEventStore((state) => state.templates);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const template = templates.find((t, index) => 
        String(index + 1) === key || 
        t.title.toLowerCase().startsWith(key)
      );
      
      if (template) {
        onTemplateSelect(template);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [templates, onTemplateSelect]);

  if (templates.length === 0) return null;

  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 min-w-48 z-10">
      <div className="text-xs font-medium text-gray-500 mb-2">
        Quick Add ({format(day, 'MMM d')})
      </div>
      <div className="space-y-1">
        {templates.map((template, index) => (
          <div
            key={template.id}
            className="flex items-center justify-between text-sm px-2 py-1 hover:bg-gray-50 rounded"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: template.color }}
              />
              <span className="text-gray-700">{template.title}</span>
            </div>
            <span className="text-xs text-gray-400">
              {`[${index + 1}]`}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">
        Press number or first letter
      </div>
    </div>
  );
}

export default TemplateShortcuts;