import React, { useState, useEffect } from 'react';
import { ViewState } from '../types/types';
import { StatCard } from '../components/StatCard';
import { dashboardService } from '../services/dashboardService';
import { 
  Wallet, Scissors, CheckCircle, BarChart, ShoppingCart, ClipboardList, UserCheck, Ruler, Loader2
} from 'lucide-react';
import { ApiError } from '../services/api';

export const Dashboard: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [stats, setStats] = useState({
        today_sales: 0,
        monthly_sales: 0,
        pending_orders: 0,
        ready_orders: 0,
        unpaid_bills: 0,
        upcoming_delivery: [] as Array<{ name: string; delivery_date: string }>
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load dashboard stats');
            console.error('Error loading dashboard:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                    <p className="text-gray-500 mt-1">Overview of your business performance</p>
                </div>
                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Sales" value={`₹${stats.today_sales}`} icon={Wallet} color="bg-emerald-500" />
                <StatCard title="Pending Orders" value={stats.pending_orders} icon={Scissors} color="bg-orange-500" />
                <StatCard title="Ready to Deliver" value={stats.ready_orders} icon={CheckCircle} color="bg-blue-500" />
                <StatCard title="Monthly Revenue" value={`₹${(stats.monthly_sales / 1000).toFixed(1)}k`} icon={BarChart} color="bg-purple-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => onNavigate('salesEntry')} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-purple-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
                        <ShoppingCart size={32} className="text-purple-600"/>
                    </div>
                    <h3 className="font-bold text-gray-800">New Sale</h3>
                    <p className="text-sm text-gray-500 mt-1">Create a new bill</p>
                </div>
                <div onClick={() => onNavigate('orders')} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                        <ClipboardList size={32} className="text-blue-600"/>
                    </div>
                    <h3 className="font-bold text-gray-800">Manage Orders</h3>
                    <p className="text-sm text-gray-500 mt-1">Track job status</p>
                </div>
                <div onClick={() => onNavigate('customers')} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-green-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                        <UserCheck size={32} className="text-green-600"/>
                    </div>
                    <h3 className="font-bold text-gray-800">Add Customer</h3>
                    <p className="text-sm text-gray-500 mt-1">Save new client</p>
                </div>
                <div onClick={() => onNavigate('measurements')} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                        <Ruler size={32} className="text-orange-600"/>
                    </div>
                    <h3 className="font-bold text-gray-800">Measurements</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage size charts</p>
                </div>
            </div>
        </div>
    );
};
