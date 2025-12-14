import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ViewState } from './types/types';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Orders } from './pages/Orders';
import { WorkSchedule } from './pages/WorkSchedule';
import { Measurements } from './pages/Measurements';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { SalesReport } from './pages/SalesReport';
import { WorkerReport } from './pages/WorkerReport';
import { authService } from './services/authService';
import { Bell, Search, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  useEffect(() => {
    // Check if user is already authenticated
    setIsLoggedIn(authService.isAuthenticated());
  }, []);

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-900">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64">
            <Search size={18} className="text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search order, customer..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-800 placeholder-gray-500 bg-gray-50 text-gray-900"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <button 
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-gray-600 hover:text-red-600 transition"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
            {currentView === 'customers' && <Customers onNavigate={setCurrentView} />}
            {currentView === 'orders' && <Orders />}
            {currentView === 'workSchedule' && <WorkSchedule />}
            {currentView === 'measurements' && <Measurements onNavigate={setCurrentView} />}
            {currentView === 'products' && <Inventory />}
            {currentView === 'salesEntry' && <Sales onNavigate={setCurrentView} />}
            {currentView === 'salesReport' && <SalesReport onNavigate={setCurrentView} />}
            {currentView === 'workerReport' && <WorkerReport />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;


