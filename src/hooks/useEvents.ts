import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';
import { useEventStore, Event } from '../stores/eventStore';

export function useEvents(date: Date) {
  const events = useEventStore((state) => state.events);

  return useQuery({
    queryKey: ['events', format(date, 'yyyy-MM')],
    queryFn: () => {
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      return events.filter((event) => {
        const eventDate = parseISO(event.start);
        return eventDate >= monthStart && eventDate <= monthEnd;
      });
    },
    enabled: true,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const addEvent = useEventStore((state) => state.addEvent);

  return useMutation({
    mutationFn: async (event: Omit<Event, 'id'>) => {
      const newEvent = { ...event, id: Date.now().toString() };
      addEvent(newEvent);
      return newEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const removeEvent = useEventStore((state) => state.removeEvent);

  return useMutation({
    mutationFn: async (eventId: string) => {
      removeEvent(eventId);
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}