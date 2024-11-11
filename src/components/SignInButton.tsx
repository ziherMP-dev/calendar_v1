import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

function SignInButton() {
  const { isAuthenticated, signIn, signOut } = useAuthStore();

  return isAuthenticated ? (
    <button
      onClick={signOut}
      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </button>
  ) : (
    <button
      onClick={signIn}
      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign in with Google
    </button>
  );
}

export default SignInButton;