import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
}

export interface EventTemplate {
  id: string;
  title: string;
  color: string;
  startTime: string;
  duration: string;
  endTime: string;
}

interface EventState {
  events: Event[];
  templates: EventTemplate[];
  addEvent: (event: Event) => void;
  removeEvent: (id: string) => void;
  addTemplate: (template: EventTemplate) => void;
  removeTemplate: (id: string) => void;
}

export const useEventStore = create<EventState>()(
  persist(
    (set) => ({
      events: [],
      templates: [],
      addEvent: (event) => 
        set((state) => ({
          events: [...state.events, event]
        })),
      removeEvent: (id) => 
        set((state) => ({
          events: state.events.filter((event) => event.id !== id)
        })),
      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template]
        })),
      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id)
        })),
    }),
    {
      name: 'event-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        if (version === 1) {
          return {
            ...persistedState,
            templates: persistedState.templates.map((t: any) => ({
              ...t,
              startTime: '09:00',
              duration: '01:00',
              endTime: '10:00',
            })),
          };
        }
        return persistedState as EventState;
      },
    }
  )
);