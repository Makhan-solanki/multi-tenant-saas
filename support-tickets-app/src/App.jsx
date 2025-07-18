// src/App.jsx
import React, { useState, useEffect } from "react";
import { TicketList } from "./components/TicketList";
import { TicketForm } from "./components/TicketForm";
import { TicketDetails } from "./components/TicketDetails";
import { LoadingSpinner } from "./components/LoadingSpinner";

const VIEWS = {
  LIST: 'list',
  CREATE: 'create',
  EDIT: 'edit',
  DETAILS: 'details'
};

function AuthWrapper({ children }) {
  const [AuthComponents, setAuthComponents] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const authModule = await import('react-shell/AuthContext');
        console.log('Available exports:', Object.keys(authModule));
        
        // Extract the components we need
        const { AuthProvider, useAuth } = authModule;
        
        if (!AuthProvider) {
          throw new Error('AuthProvider not found in module');
        }
        if (!useAuth) {
          throw new Error('useAuth not found in module');
        }
        
        setAuthComponents({ AuthProvider, useAuth });
      } catch (err) {
        console.error('Failed to load auth:', err);
        setError(err);
      }
    };

    loadAuth();
  }, []);

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
        Failed to load authentication: {error.message}
      </div>
    );
  }

  if (!AuthComponents) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  const { AuthProvider } = AuthComponents;
  
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}

function AppContent() {
  const [useAuth, setUseAuth] = useState(null);
  const [currentView, setCurrentView] = useState(VIEWS.LIST);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const authModule = await import('react-shell/AuthContext');
        setUseAuth(() => authModule.useAuth);
      } catch (err) {
        console.error('Failed to load useAuth:', err);
      }
    };

    loadAuth();
  }, []);

  if (!useAuth) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Now we can use the hook
  const { user, loading: authLoading } = useAuth();

  const handleCreateNew = () => {
    setSelectedTicket(null);
    setCurrentView(VIEWS.CREATE);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentView(VIEWS.EDIT);
  };

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setCurrentView(VIEWS.DETAILS);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setCurrentView(VIEWS.LIST);
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-gray-600">Loading user context...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg shadow-sm text-red-700">
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p>Please log in via the main application to access support tickets.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-full rounded-lg shadow-inner">
      {currentView === VIEWS.LIST && (
        <TicketList
          onCreateNew={handleCreateNew}
          onEditTicket={handleEditTicket}
          onViewDetails={handleViewDetails}
          currentUserRole={user.role}
        />
      )}

      {(currentView === VIEWS.CREATE || currentView === VIEWS.EDIT) && (
        <TicketForm
          ticket={selectedTicket}
          onSave={handleBackToList}
          onCancel={handleBackToList}
        />
      )}

      {currentView === VIEWS.DETAILS && (
        <TicketDetails
          ticket={selectedTicket}
          onBack={handleBackToList}
          currentUserRole={user.role}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthWrapper>
      <AppContent />
    </AuthWrapper>
  );
}

export default App;