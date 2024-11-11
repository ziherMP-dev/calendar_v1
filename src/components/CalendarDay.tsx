import React, { useState } from 'react';
import { format, isToday, setHours, setMinutes, addDays, parse } from 'date-fns';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Event, EventTemplate } from '../stores/eventStore';
import { useDeleteEvent, useCreateEvent } from '../hooks/useEvents';
import TemplateShortcuts from './TemplateShortcuts';

interface CalendarDayProps {
  day: Date;
  events: Event[];
  isCurrentMonth: boolean;
  onClick: () => void;
}

function CalendarDay({ day, events, isCurrentMonth, onClick }: CalendarDayProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteEvent = useDeleteEvent();
  const createEvent = useCreateEvent();
  
  const dayEvents = events.filter(
    event => format(new Date(event.start), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
  );

  const handleDeleteEvent = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    deleteEvent.mutate(eventId);
  };

  const handleTemplateSelect = (template: EventTemplate) => {
    const [startHour, startMinute] = template.startTime.split(':').map(Number);
    const [endHour, endMinute] = template.endTime.split(':').map(Number);

    let startDate = setMinutes(setHours(day, startHour), startMinute);
    let endDate = setMinutes(setHours(day, endHour), endMinute);

    // If end time is earlier than start time, it means the event ends the next day
    if (endHour < startHour || (endHour === startHour && endMinute < startMinute)) {
      endDate = setMinutes(setHours(addDays(day, 1), endHour), endMinute);
    }

    createEvent.mutate({
      title: template.title,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      color: template.color,
    });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowShortcuts(true)}
      onMouseLeave={() => setShowShortcuts(false)}
      className={`
        relative min-h-[100px] p-2 border rounded-lg cursor-pointer
        ${isToday(day) ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'}
        ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
        hover:border-indigo-300 transition-colors
        ${isExpanded ? 'h-auto' : 'h-[140px]'}
      `}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={`
          text-sm font-medium
          ${isToday(day) ? 'text-indigo-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
        `}>
          {format(day, 'd')}
        </span>
        {dayEvents.length > 0 && (
          <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
            {dayEvents.length}
          </span>
        )}
      </div>

      <div className={`space-y-0.5 ${isExpanded ? '' : 'max-h-[80px] overflow-hidden'} ${dayEvents.length > 3 ? 'mb-6' : ''}`}>
        {dayEvents.map(event => (
          <div
            key={event.id}
            className="text-[11px] leading-tight py-0.5 px-1 rounded truncate group flex justify-between items-center"
            style={{
              backgroundColor: `${event.color}15`,
              color: event.color,
            }}
          >
            <span className="truncate flex-1">
              {event.title} ({format(new Date(event.start), 'HH:mm')}-{format(new Date(event.end), 'HH:mm')})
            </span>
            <button
              onClick={(e) => handleDeleteEvent(e, event.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-0.5 hover:bg-white/30 rounded"
              title="Delete event"
            >
              <Trash2 className="h-2.5 w-2.5" style={{ color: event.color }} />
            </button>
          </div>
        ))}
      </div>

      {dayEvents.length > 3 && (
        <button
          onClick={toggleExpand}
          className="absolute bottom-0 left-0 right-0 text-center py-1 text-xs text-gray-500 hover:bg-gray-50 transition-colors rounded-b-lg"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3 mx-auto" />
          ) : (
            <ChevronDown className="h-3 w-3 mx-auto" />
          )}
        </button>
      )}
      
      {showShortcuts && isCurrentMonth && (
        <TemplateShortcuts 
          onTemplateSelect={handleTemplateSelect}
          day={day}
        />
      )}
    </div>
  );
}

export default CalendarDay;