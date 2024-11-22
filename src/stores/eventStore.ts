import { create } from 'zustand';
import { db } from '../lib/db';
import { useAuthStore } from './authStore';

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
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  removeEvent: (id: string) => Promise<void>;
  addTemplate: (template: Omit<EventTemplate, 'id'>) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  templates: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const events = await db.events.getAll(user.id);
      set({ events });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch events' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTemplates: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const templates = await db.templates.getAll(user.id);
      set({ templates });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch templates' });
    } finally {
      set({ isLoading: false });
    }
  },

  addEvent: async (event) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const newEvent = await db.events.create({
        ...event,
        user_id: user.id,
      });
      set(state => ({
        events: [...state.events, newEvent],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add event' });
    } finally {
      set({ isLoading: false });
    }
  },

  removeEvent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.events.delete(id);
      set(state => ({
        events: state.events.filter(event => event.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove event' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTemplate: async (template) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const newTemplate = await db.templates.create({
        ...template,
        user_id: user.id,
      });
      set(state => ({
        templates: [...state.templates, newTemplate],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add template' });
    } finally {
      set({ isLoading: false });
    }
  },

  removeTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await db.templates.delete(id);
      set(state => ({
        templates: state.templates.filter(template => template.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove template' });
    } finally {
      set({ isLoading: false });
    }
  },
}));