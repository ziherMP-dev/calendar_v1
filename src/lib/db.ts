import { supabase } from './supabase';
import { Event, EventTemplate } from '../stores/eventStore';

export interface DBEvent extends Omit<Event, 'id'> {
  id?: string;
  user_id: string;
}

export interface DBTemplate extends Omit<EventTemplate, 'id'> {
  id?: string;
  user_id: string;
}

export const db = {
  events: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start_time,
        end: event.end_time,
        color: event.color,
      }));
    },

    async create(event: DBEvent) {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          user_id: event.user_id,
          title: event.title,
          start_time: event.start,
          end_time: event.end,
          color: event.color,
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        start: data.start_time,
        end: data.end_time,
        color: data.color,
      };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },

  templates: {
    async getAll(userId: string) {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data.map(template => ({
        id: template.id,
        title: template.title,
        color: template.color,
        startTime: template.start_time,
        endTime: template.end_time,
        duration: template.duration,
      }));
    },

    async create(template: DBTemplate) {
      const { data, error } = await supabase
        .from('templates')
        .insert([{
          user_id: template.user_id,
          title: template.title,
          color: template.color,
          start_time: template.startTime,
          end_time: template.endTime,
          duration: template.duration,
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        color: data.color,
        startTime: data.start_time,
        endTime: data.end_time,
        duration: data.duration,
      };
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
  },
}; 