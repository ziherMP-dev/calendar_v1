import React, { useState } from 'react';
import { Plus, X, Trash2, FileText, Moon, Phone, Calculator } from 'lucide-react';
import { useEventStore, EventTemplate } from '../stores/eventStore';
import PrintableTable from './PrintableTable';
import { format } from 'date-fns';

interface EventTemplatesProps {
  onSelectTemplate: (template: EventTemplate) => void;
}

function EventTemplates({ onSelectTemplate }: EventTemplatesProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [reportType, setReportType] = useState<'regular' | 'night' | 'phone' | 'summary'>('regular');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#4F46E5');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const { templates, addTemplate, removeTemplate, events } = useEventStore();

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const template: EventTemplate = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      color: newColor,
      startTime,
      duration: '0:00',
      endTime,
    };

    addTemplate(template);
    setNewTitle('');
    setIsCreating(false);
  };

  const handleShowReport = (type: 'regular' | 'night' | 'phone' | 'summary') => {
    setReportType(type);
    setShowTable(true);
  };

  const formatDuration = (template: EventTemplate) => {
    return `${template.startTime} - ${template.endTime}`;
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Event Templates</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateTemplate} className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">New Template</span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Template name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 mt-4"
            >
              Create Template
            </button>
          </form>
        )}

        <div className="space-y-1">
          {templates.map((template, index) => (
            <div
              key={template.id}
              className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-50 group"
            >
              <button
                onClick={() => onSelectTemplate(template)}
                className="flex items-center flex-1 min-w-0"
              >
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded text-xs font-medium text-gray-600 mr-2">
                  {index + 1}
                </span>
                <div
                  className="w-2.5 h-2.5 flex-shrink-0 rounded-full mr-2"
                  style={{ backgroundColor: template.color }}
                />
                <span className="text-sm text-gray-700 truncate">{template.title}</span>
                <span className="text-xs text-gray-400 ml-1.5 flex-shrink-0">
                  {formatDuration(template)}
                </span>
              </button>
              <button
                onClick={() => removeTemplate(template.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                title="Delete template"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {templates.length === 0 && !isCreating && (
          <p className="text-sm text-gray-500 text-center py-4">
            No templates yet. Create one to quickly add events.
          </p>
        )}

        {templates.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-4">
              Press number key (1-9) to add template
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t">
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Report End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleShowReport('regular')}
              className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Regular Days Report
            </button>
            <button
              onClick={() => handleShowReport('night')}
              className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Moon className="h-4 w-4 mr-2" />
              Generate Night Shifts Report
            </button>
            <button
              onClick={() => handleShowReport('phone')}
              className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Generate Phone Calls Report
            </button>
            <button
              onClick={() => handleShowReport('summary')}
              className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Generate Summary Report
            </button>
          </div>
        </div>
      </div>

      {showTable && (
        <PrintableTable
          events={events}
          reportType={reportType}
          onClose={() => setShowTable(false)}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </>
  );
}

export default EventTemplates;