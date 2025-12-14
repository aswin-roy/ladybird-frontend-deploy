import React from 'react';
import { 
  Home, 
  Users, 
  ClipboardList, 
  Settings,
  FileText,
  Scissors, 
  Ruler,
  Package,
  ShoppingCart,
  BarChart,
  Grid,
  Calendar,
  Briefcase
} from 'lucide-react';
import { ViewState } from '../types/types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  
  const navItemClass = (view: ViewState) => 
    `flex items-center p-3 rounded cursor-pointer transition-colors ${
      currentView === view 
        ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="w-64 bg-[#0b1120] flex flex-col h-screen flex-shrink-0 border-r border-gray-800 transition-all duration-300">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 bg-[#0b1120] border-b border-gray-800">
        <div className="w-8 h-8 bg-purple-600 rounded-md mr-3 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <span className="text-white font-bold text-lg">L</span>
        </div>
        <div>
          <h1 className="text-white font-bold text-lg tracking-wide leading-tight">LADYBIRD</h1>
          <p className="text-xs text-gray-500">Tailoring & Billing</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        
        <div onClick={() => onNavigate('dashboard')} className={navItemClass('dashboard')}>
          <Home size={20} className="mr-3" />
          <span className="text-sm font-medium">Dashboard</span>
        </div>

        <div onClick={() => onNavigate('customers')} className={navItemClass('customers')}>
          <Users size={20} className="mr-3" />
          <span className="text-sm font-medium">Customers</span>
        </div>

        <div onClick={() => onNavigate('orders')} className={navItemClass('orders')}>
          <ClipboardList size={20} className="mr-3" />
          <span className="text-sm font-medium">Orders</span>
        </div>

        <div onClick={() => onNavigate('workSchedule')} className={navItemClass('workSchedule')}>
          <Calendar size={20} className="mr-3" />
          <span className="text-sm font-medium">Work Schedule</span>
        </div>

        <div onClick={() => onNavigate('measurements')} className={navItemClass('measurements')}>
          <Ruler size={20} className="mr-3" />
          <span className="text-sm font-medium">Measurements</span>
        </div>
        
        <div onClick={() => onNavigate('products')} className={navItemClass('products')}>
          <Package size={20} className="mr-3" />
          <span className="text-sm font-medium">Inventory</span>
        </div>

        <div className="my-2 border-t border-gray-800 mx-2"></div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sales & Billing
        </div>

        <div onClick={() => onNavigate('salesEntry')} className={navItemClass('salesEntry')}>
          <ShoppingCart size={20} className="mr-3" />
          <span className="text-sm font-medium">Sales Entry</span>
        </div>

        <div onClick={() => onNavigate('salesReport')} className={navItemClass('salesReport')}>
          <BarChart size={20} className="mr-3" />
          <span className="text-sm font-medium">Sales Report</span>
        </div>

        <div className="my-2 border-t border-gray-800 mx-2"></div>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Resources
        </div>

        <div onClick={() => onNavigate('workerReport')} className={navItemClass('workerReport')}>
          <Briefcase size={20} className="mr-3" />
          <span className="text-sm font-medium">Worker Report</span>
        </div>
      </div>
      
      {/* User Profile Snippet */}
      <div className="p-4 border-t border-gray-800 bg-[#0f1623]">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white font-bold">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <p className="text-xs text-gray-500">admin@boutique.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};


