import React, { useState } from 'react';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import EventModal from './EventModal';
import { useEventStore } from '../stores/eventStore';
import CalendarDay from './CalendarDay';

interface CalendarProps {
  selectedTemplate?: EventTemplate;
  onTemplateUsed: () => void;
}

function Calendar({ selectedTemplate, onTemplateUsed }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { events = [], isLoading, error } = useEventStore();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const previousMonth = () => setCurrentDate(date => addMonths(date, -1));
  const nextMonth = () => setCurrentDate(date => addMonths(date, 1));

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    onTemplateUsed();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date());
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 text-sm py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {allDays.map((day) => (
            <CalendarDay
              key={day.toString()}
              day={day}
              events={events}
              isCurrentMonth={isSameMonth(day, currentDate)}
              onClick={() => handleDayClick(day)}
            />
          ))}
        </div>
      </div>

      {isModalOpen && (
        <EventModal 
          onClose={handleModalClose}
          selectedDate={selectedDate || new Date()}
          template={selectedTemplate}
        />
      )}
    </div>
  );
}

export default Calendar;