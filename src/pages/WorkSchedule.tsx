import React, { useState, useEffect } from 'react';
import { Order } from '../types/types';
import { orderService } from '../services/orderService';
import { ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const WorkSchedule: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [statusUpdates, setStatusUpdates] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await orderService.getAll();
            setOrders(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load orders');
            console.error('Error loading orders:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const formatDateString = (day: number) => `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Cutting': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Stitching': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
        case 'Delivered': return 'bg-gray-100 text-gray-600 border-gray-200';
        case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
        default: return 'bg-gray-50 text-gray-500';
      }
    };
    
    const stageStatusUpdate = (orderId: number, newStatus: string) => setStatusUpdates(prev => ({ ...prev, [orderId]: newStatus }));
    
    const commitStatusUpdate = async (orderId: number) => {
        const newStatus = statusUpdates[orderId];
        if (!newStatus) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await orderService.update({
                id: orderId,
                status: newStatus as Order['status'],
            });
            const remaining = { ...statusUpdates };
            delete remaining[orderId];
            setStatusUpdates(remaining);
            await loadOrders();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to update order status');
            alert(apiError.message || 'Failed to update order status');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const dailyOrders = selectedDay ? orders.filter(o => o.delivery_date === selectedDay) : [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] bg-gray-50 rounded-2xl shadow-sm border border-gray-200">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Production Schedule</h2>
                   <p className="text-sm text-gray-500">Manage daily workload and deliveries</p>
                </div>
                <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="text-lg font-bold text-gray-800 w-32 text-center select-none">{monthName} {year}</span>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600">
                    <ChevronRight size={20} />
                  </button>
                </div>
            </div>
    
            <div className="flex-1 overflow-auto p-6">
                <div className="grid grid-cols-7 gap-4 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-bold text-gray-400 uppercase text-xs tracking-wider">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-32 bg-gray-50/30 rounded-xl border border-dashed border-gray-200"></div>
                  ))}
                  
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = formatDateString(day);
                    const daysOrders = orders.filter(o => o.delivery_date === dateStr);
                    const isToday = new Date().toDateString() === new Date(year, currentDate.getMonth(), day).toDateString();
    
                    return (
                      <div 
                        key={day} 
                        onClick={() => { setSelectedDay(dateStr); setStatusUpdates({}); }}
                        className={`h-32 border rounded-xl p-2 relative cursor-pointer transition-all hover:shadow-md hover:border-purple-300 group ${
                            isToday ? 'bg-purple-50/30 border-purple-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className={`absolute top-2 right-2 text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 group-hover:text-purple-600'
                        }`}>
                            {day}
                        </span>
                        
                        <div className="mt-6 space-y-1.5 overflow-y-auto max-h-[calc(100%-1.5rem)] custom-scrollbar">
                            {daysOrders.map(order => (
                                <div key={order.id} className={`text-[10px] px-2 py-1 rounded border truncate font-medium ${getStatusColor(order.status)}`}>
                                    {order.customer}
                                </div>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
            </div>

            {selectedDay && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-100">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Daily Production Sheet</h3>
                                <p className="text-sm text-gray-500 font-medium">Date: {new Date(selectedDay).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button onClick={() => setSelectedDay(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {dailyOrders.length > 0 ? (
                                <div className="space-y-4">
                                    {dailyOrders.map(order => {
                                        const stagedStatus = statusUpdates[order.id];
                                        const currentStatus = stagedStatus || order.status;
                                        const isModified = stagedStatus && stagedStatus !== order.status;
                                        return (
                                            <div key={order.id} className="flex items-center p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                                                <div className="mr-4">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{order.customer}</h4>
                                                            <p className="text-sm text-gray-500">{order.item}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                <select 
                                                                    value={currentStatus} 
                                                                    onChange={(e) => stageStatusUpdate(order.id, e.target.value)} 
                                                                    className={`text-xs font-bold uppercase border-none focus:ring-2 focus:ring-purple-500 rounded px-3 py-1.5 cursor-pointer outline-none ${getStatusColor(currentStatus)}`}
                                                                    disabled={isSubmitting}
                                                                >
                                                                    {['Pending', 'Cutting', 'Stitching', 'In Progress', 'Ready', 'Delivered'].map(s => (
                                                                        <option key={s} value={s}>{s}</option>
                                                                    ))}
                                                                </select>
                                                                {isModified && (
                                                                    <button 
                                                                        onClick={() => commitStatusUpdate(order.id)} 
                                                                        className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                                        disabled={isSubmitting}
                                                                    >
                                                                        {isSubmitting && <Loader2 className="animate-spin" size={12} />}
                                                                        Update
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-500">No orders scheduled for this day.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
