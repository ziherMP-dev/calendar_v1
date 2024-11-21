import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Calendar from './components/Calendar';
import EventTemplates from './components/EventTemplates';
import AuthForm from './components/AuthForm';
import { useAuthStore } from './stores/authStore';
import SignInButton from './components/SignInButton';
import { EventTemplate } from './stores/eventStore';

const queryClient = new QueryClient();

function App() {
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate | undefined>();
  const { isAuthenticated, isLoading } = useAuthStore();

  const handleTemplateSelect = (template: EventTemplate) => {
    setSelectedTemplate(template);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
                <span className="font-semibold text-xl text-gray-900">WorkDay Planner</span>
              </div>
              <SignInButton />
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-6">
            <div className="w-64 flex-shrink-0">
              <EventTemplates onSelectTemplate={handleTemplateSelect} />
            </div>
            <div className="flex-1">
              <Calendar selectedTemplate={selectedTemplate} onTemplateUsed={() => setSelectedTemplate(undefined)} />
            </div>
          </div>
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;