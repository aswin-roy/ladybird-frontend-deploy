
import React, { useState, useEffect, useCallback } from 'react';
import { Order, WorkerAssignment, Customer } from '../types/types';
import { InputField, SelectField, Pagination } from '../components';
import { orderService } from '../services/orderService';
import { workerService } from '../services/workerService';
import { customerService } from '../services/customerService';
import { Worker } from '../types/types';
import { Plus, Search, X, Trash2, Edit2, Eye, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Customer search state
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [ordersData, workersData, customersData] = await Promise.all([
                orderService.getAll(),
                workerService.getAll(),
                customerService.getAll()
            ]);
            setOrders(ordersData);
            setWorkers(workersData);
            setCustomers(customersData);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewOrder = () => {
        setEditingOrder({
            id: 0,
            customerId: '',
            customer: '',
            phone: '',
            item: '',
            status: 'Pending',
            delivery_date: new Date().toISOString().split('T')[0],
            workers: []
        });
        setCustomerSearchTerm('');
        setCustomerSuggestions([]);
        setShowSuggestions(false);
    };

    const handleSelectCustomer = useCallback((customer: Customer) => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                customerId: customer._id || '',
                customer: customer.name,
                phone: customer.phone
            });
        }
        setCustomerSearchTerm(customer.name);
        setShowSuggestions(false);
        setCustomerSuggestions([]);
    }, [editingOrder]);

    const handleCustomerSearchChange = (value: string) => {
        setCustomerSearchTerm(value);
        if (!value) {
            // Clear customer fields if search is cleared
            if (editingOrder) {
                setEditingOrder({
                    ...editingOrder,
                    customerId: '',
                    customer: '',
                    phone: ''
                });
            }
            setCustomerSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Debounced customer search
    useEffect(() => {
        if (!editingOrder) return;

        // Don't search if the term matches the currently selected customer
        if (customerSearchTerm === editingOrder.customer) return;

        const searchCustomers = async () => {
            if (customerSearchTerm.trim().length < 2) {
                setCustomerSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                setIsSearchingCustomers(true);
                const results = await customerService.getByQuery(customerSearchTerm);
                setCustomerSuggestions(results);

                // Auto-select if exactly one match found
                if (results.length === 1) {
                    handleSelectCustomer(results[0]);
                } else {
                    setShowSuggestions(results.length > 0);
                }
            } catch (err) {
                console.error('Error searching customers:', err);
                setCustomerSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsSearchingCustomers(false);
            }
        };

        const timeoutId = setTimeout(searchCustomers, 300);
        return () => clearTimeout(timeoutId);
    }, [customerSearchTerm, editingOrder, handleSelectCustomer]);

    const handleKeyDown = (e: React.KeyboardEvent, nextId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(nextId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleUpdateOrder = async () => {
        if (!editingOrder) return;

        if (!editingOrder.customerId || !editingOrder.item) {
            alert('Customer and item are required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Map workers to workerAssignment format
            const workerAssignment = editingOrder.workers.map(w => {
                const worker = workers.find(worker => worker.name === w.name);
                // Use MongoDB _id if available, otherwise fall back to id
                const workerId = worker ? (worker._id || String(worker.id)) : '';
                return {
                    worker: workerId,
                    task: w.task,
                    commission: w.commission
                };
            }).filter(wa => wa.worker); // Only include valid workers

            const orderData = {
                customerId: editingOrder.customerId,
                item: editingOrder.item,
                status: editingOrder.status,
                deliveryDate: editingOrder.delivery_date,
                workerAssignment: workerAssignment.length > 0 ? workerAssignment : undefined
            };

            if (editingOrder.id === 0) {
                await orderService.create(orderData);
            } else {
                // Use MongoDB _id if available, otherwise fall back to numeric id
                const orderId = editingOrder._id || editingOrder.id;
                await orderService.update({
                    id: orderId,
                    ...orderData
                });
            }

            setEditingOrder(null);
            await loadData();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save order');
            alert(apiError.message || 'Failed to save order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOrder = async (order: Order) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            setError(null);
            // Use MongoDB _id if available, otherwise fall back to numeric id
            const orderId = order._id || String(order.id);
            await orderService.delete(orderId);
            await loadData();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to delete order');
            alert(apiError.message || 'Failed to delete order');
        }
    };

    const filteredOrders = orders.filter(order =>
        order.status !== 'Delivered' && // Exclude delivered orders from the default view
        (order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm) ||
            order.item.toLowerCase().includes(searchTerm))
    );

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const addWorkerToOrder = () => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                workers: [...editingOrder.workers, { name: '', task: 'Stitching', commission: 0 }]
            });
        }
    };

    const removeWorkerFromOrder = (index: number) => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                workers: editingOrder.workers.filter((_, i) => i !== index)
            });
        }
    };

    const updateWorkerInOrder = (index: number, updatedAssignment: WorkerAssignment) => {
        if (editingOrder) {
            const updatedWorkers = [...editingOrder.workers];
            updatedWorkers[index] = updatedAssignment;
            setEditingOrder({ ...editingOrder, workers: updatedWorkers });
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
        <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)] relative">
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
                    {error}
                </div>
            )}

            {viewingOrder && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-xl">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Order Details #{viewingOrder.id}</h3>
                                <p className="text-sm text-gray-500">{viewingOrder.item}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-gray-500 font-bold">Customer:</p><p className="text-gray-900">{viewingOrder.customer}</p></div>
                                <div><p className="text-gray-500 font-bold">Phone:</p><p className="text-gray-900">{viewingOrder.phone || '-'}</p></div>
                                <div><p className="text-gray-500 font-bold">Delivery Date:</p><p className="text-gray-900">{viewingOrder.delivery_date || '-'}</p></div>
                                <div><p className="text-gray-500 font-bold">Status:</p><p className="text-gray-900 font-semibold">{viewingOrder.status}</p></div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-gray-500 font-bold mb-2">Worker Assignments:</p>
                                <div className="space-y-2">
                                    {viewingOrder.workers.length > 0 ? viewingOrder.workers.map((w, i) => (
                                        <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                            <p className="font-semibold text-purple-800">{w.name}</p>
                                            <p className="text-xs text-purple-600">Task: {w.task} | Commission: ₹{w.commission}</p>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No workers assigned.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingOrder && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-xl sticky top-0">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{editingOrder.id === 0 ? 'New Order' : `Manage Order #${editingOrder.id}`}</h3>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Customer</label>
                                    <div className="relative">
                                        <InputField
                                            id="order-customer-search"
                                            value={customerSearchTerm}
                                            onChange={(e) => handleCustomerSearchChange(e.target.value)}
                                            placeholder="Search by customer name or phone..."
                                            disabled={isSubmitting}
                                            onKeyDown={(e) => handleKeyDown(e, 'order-item')}
                                            onFocus={() => {
                                                if (customerSuggestions.length > 0) {
                                                    setShowSuggestions(true);
                                                }
                                            }}
                                            onBlur={() => {
                                                // Delay hiding to allow click on suggestion
                                                setTimeout(() => setShowSuggestions(false), 200);
                                            }}
                                        />
                                        {isSearchingCustomers && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Loader2 className="animate-spin text-gray-400" size={16} />
                                            </div>
                                        )}
                                        {showSuggestions && customerSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                                                {customerSuggestions.map(customer => (
                                                    <div
                                                        key={customer._id || customer.id}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            handleSelectCustomer(customer);
                                                        }}
                                                        className="p-3 hover:bg-purple-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">{customer.phone || 'No phone'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showSuggestions && customerSearchTerm.length >= 2 && customerSuggestions.length === 0 && !isSearchingCustomers && (
                                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 p-3">
                                                <p className="text-sm text-gray-500">No customers found</p>
                                            </div>
                                        )}
                                    </div>
                                    {editingOrder.customer && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            Selected: <span className="font-semibold">{editingOrder.customer}</span>
                                            {editingOrder.phone && <span className="ml-2">({editingOrder.phone})</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item</label>
                                    <InputField
                                        id="order-item"
                                        value={editingOrder.item}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, item: e.target.value })}
                                        placeholder="e.g. Shirt, Suit"
                                        disabled={isSubmitting}
                                        onKeyDown={(e) => handleKeyDown(e, 'order-delivery')}
                                    />
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Worker Assignments</label>
                                <div className="space-y-3">
                                    {editingOrder.workers.map((worker, index) => (
                                        <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold">Worker</label>
                                                <SelectField
                                                    value={worker.name}
                                                    onChange={(e) => updateWorkerInOrder(index, { ...worker, name: e.target.value })}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select Worker</option>
                                                    {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                                </SelectField>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold">Task</label>
                                                <SelectField
                                                    value={worker.task}
                                                    onChange={(e) => updateWorkerInOrder(index, { ...worker, task: e.target.value as any })}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="Cutting">Cutting</option>
                                                    <option value="Stitching">Stitching</option>
                                                </SelectField>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold">Commission</label>
                                                <InputField
                                                    type="number"
                                                    value={worker.commission}
                                                    onChange={(e) => updateWorkerInOrder(index, { ...worker, commission: Number(e.target.value) })}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <button
                                                onClick={() => removeWorkerFromOrder(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                disabled={isSubmitting}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={addWorkerToOrder}
                                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 hover:border-gray-400"
                                        disabled={isSubmitting}
                                    >
                                        Add another worker
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Update Status</label>
                                    <SelectField
                                        value={editingOrder.status}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as any })}
                                        disabled={isSubmitting}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Cutting">Cutting</option>
                                        <option value="Stitching">Stitching</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Delivered">Delivered</option>
                                    </SelectField>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Delivery Date</label>
                                    <InputField
                                        id="order-delivery"
                                        type="date"
                                        value={editingOrder.delivery_date || ''}
                                        onChange={(e) => setEditingOrder({ ...editingOrder, delivery_date: e.target.value })}
                                        disabled={isSubmitting}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleUpdateOrder();
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t border-gray-200 rounded-b-xl mt-auto">
                            <button
                                onClick={() => setEditingOrder(null)}
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg text-sm"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateOrder}
                                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg text-sm hover:bg-purple-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                {editingOrder.id === 0 ? 'Create Order' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-xl text-gray-900">Order Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Track status and delivery dates</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <InputField
                            placeholder="Search orders..."
                            className="pl-10 w-64"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <button
                        onClick={handleNewOrder}
                        className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md"
                    >
                        <Plus size={18} /> New Order
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Create your first order to get started'}</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-[#312161] text-white text-xs uppercase tracking-wider font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Workers</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Delivery</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{order.customer}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{order.item}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {order.workers.length > 0 ? order.workers.map(w => w.name.split(' ')[0]).join(', ') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                            order.status === 'Ready' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                order.status === 'Cutting' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                    order.status === 'Stitching' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                                        order.status === 'Delivered' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                                                            'bg-blue-100 text-blue-700 border border-blue-200'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{order.delivery_date || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setViewingOrder(order)}
                                                className="text-gray-400 hover:text-purple-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-purple-50"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingOrder(order);
                                                    // Set customer search term when editing
                                                    setCustomerSearchTerm(order.customer || '');
                                                    setCustomerSuggestions([]);
                                                    setShowSuggestions(false);
                                                }}
                                                className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-blue-50"
                                                title="Edit Order"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteOrder(order)}
                                                className="text-gray-400 hover:text-red-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-red-50"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};




/*import React, { useState, useEffect, useCallback } from 'react';
import { Order, WorkerAssignment, Customer } from '../types/types';
import { InputField, SelectField, Pagination } from '../components';
import { orderService } from '../services/orderService';
import { workerService } from '../services/workerService';
import { customerService } from '../services/customerService';
import { Worker } from '../types/types';
import { Plus, Search, X, Trash2, Edit2, Eye, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Customer search state
    const [customerSearchTerm, setCustomerSearchTerm] = useState('');
    const [customerSuggestions, setCustomerSuggestions] = useState<Customer[]>([]);
    const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [ordersData, workersData, customersData] = await Promise.all([
                orderService.getAll(),
                workerService.getAll(),
                customerService.getAll()
            ]);
            setOrders(ordersData);
            setWorkers(workersData);
            setCustomers(customersData);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewOrder = () => {
        setEditingOrder({
            id: 0,
            customerId: '',
            customer: '',
            phone: '',
            item: '',
            status: 'Pending',
            delivery_date: new Date().toISOString().split('T')[0],
            workers: []
        });
        setCustomerSearchTerm('');
        setCustomerSuggestions([]);
        setShowSuggestions(false);
    };
    
    const handleSelectCustomer = useCallback((customer: Customer) => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                customerId: customer._id || '',
                customer: customer.name,
                phone: customer.phone
            });
        }
        setCustomerSearchTerm(customer.name);
        setShowSuggestions(false);
        setCustomerSuggestions([]);
    }, [editingOrder]);
    
    const handleCustomerSearchChange = (value: string) => {
        setCustomerSearchTerm(value);
        if (!value) {
            // Clear customer fields if search is cleared
            if (editingOrder) {
                setEditingOrder({
                    ...editingOrder,
                    customerId: '',
                    customer: '',
                    phone: ''
                });
            }
            setCustomerSuggestions([]);
            setShowSuggestions(false);
        }
    };
    
    // Debounced customer search
    useEffect(() => {
        if (!editingOrder) return;
        
        const searchCustomers = async () => {
            if (customerSearchTerm.trim().length < 2) {
                setCustomerSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            
            try {
                setIsSearchingCustomers(true);
                const results = await customerService.getByQuery(customerSearchTerm);
                setCustomerSuggestions(results);
                
                // Auto-select if exactly one match found
                if (results.length === 1) {
                    handleSelectCustomer(results[0]);
                } else {
                    setShowSuggestions(results.length > 0);
                }
            } catch (err) {
                console.error('Error searching customers:', err);
                setCustomerSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsSearchingCustomers(false);
            }
        };
        
        const timeoutId = setTimeout(searchCustomers, 300);
        return () => clearTimeout(timeoutId);
    }, [customerSearchTerm, editingOrder, handleSelectCustomer]);

    const handleUpdateOrder = async () => {
        if (!editingOrder) return;

        if (!editingOrder.customerId || !editingOrder.item) {
            alert('Customer and item are required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            
            // Map workers to workerAssignment format
            const workerAssignment = editingOrder.workers.map(w => {
                const worker = workers.find(worker => worker.name === w.name);
                // Use MongoDB _id if available, otherwise fall back to id
                const workerId = worker ? (worker._id || String(worker.id)) : '';
                return {
                    worker: workerId,
                    task: w.task,
                    commission: w.commission
                };
            }).filter(wa => wa.worker); // Only include valid workers

            const orderData = {
                customerId: editingOrder.customerId,
                item: editingOrder.item,
                status: editingOrder.status,
                deliveryDate: editingOrder.delivery_date,
                workerAssignment: workerAssignment.length > 0 ? workerAssignment : undefined
            };
            
            if (editingOrder.id === 0) {
                await orderService.create(orderData);
            } else {
                // Use MongoDB _id if available, otherwise fall back to numeric id
                const orderId = editingOrder._id || editingOrder.id;
                await orderService.update({
                    id: orderId,
                    ...orderData
                });
            }
            
            setEditingOrder(null);
            await loadData();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save order');
            alert(apiError.message || 'Failed to save order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteOrder = async (order: Order) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        try {
            setError(null);
            // Use MongoDB _id if available, otherwise fall back to numeric id
            const orderId = order._id || String(order.id);
            await orderService.delete(orderId);
            await loadData();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to delete order');
            alert(apiError.message || 'Failed to delete order');
        }
    };

    const filteredOrders = orders.filter(order => 
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm) ||
        order.item.toLowerCase().includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const addWorkerToOrder = () => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                workers: [...editingOrder.workers, { name: '', task: 'Stitching', commission: 0 }]
            });
        }
    };

    const removeWorkerFromOrder = (index: number) => {
        if (editingOrder) {
            setEditingOrder({
                ...editingOrder,
                workers: editingOrder.workers.filter((_, i) => i !== index)
            });
        }
    };

    const updateWorkerInOrder = (index: number, updatedAssignment: WorkerAssignment) => {
        if (editingOrder) {
            const updatedWorkers = [...editingOrder.workers];
            updatedWorkers[index] = updatedAssignment;
            setEditingOrder({ ...editingOrder, workers: updatedWorkers });
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
        <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)] relative">
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
                    {error}
                </div>
            )}

            {viewingOrder && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-xl">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Order Details #{viewingOrder.id}</h3>
                                <p className="text-sm text-gray-500">{viewingOrder.item}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><p className="text-gray-500 font-bold">Customer:</p><p className="text-gray-900">{viewingOrder.customer}</p></div>
                                <div><p className="text-gray-500 font-bold">Phone:</p><p className="text-gray-900">{viewingOrder.phone || '-'}</p></div>
                                <div><p className="text-gray-500 font-bold">Delivery Date:</p><p className="text-gray-900">{viewingOrder.delivery_date || '-'}</p></div>
                                <div><p className="text-gray-500 font-bold">Status:</p><p className="text-gray-900 font-semibold">{viewingOrder.status}</p></div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-gray-500 font-bold mb-2">Worker Assignments:</p>
                                <div className="space-y-2">
                                    {viewingOrder.workers.length > 0 ? viewingOrder.workers.map((w, i) => (
                                        <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                            <p className="font-semibold text-purple-800">{w.name}</p>
                                            <p className="text-xs text-purple-600">Task: {w.task} | Commission: ₹{w.commission}</p>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No workers assigned.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editingOrder && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 max-h-[90vh] flex flex-col">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-100 rounded-t-xl sticky top-0">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{editingOrder.id === 0 ? 'New Order' : `Manage Order #${editingOrder.id}`}</h3>
                            </div>
                            <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6 space-y-5 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Customer</label>
                                    <div className="relative">
                                        <InputField 
                                            value={customerSearchTerm} 
                                            onChange={(e) => handleCustomerSearchChange(e.target.value)}
                                            placeholder="Search by customer name or phone..."
                                            disabled={isSubmitting}
                                            onFocus={() => {
                                                if (customerSuggestions.length > 0) {
                                                    setShowSuggestions(true);
                                                }
                                            }}
                                            onBlur={() => {
                                                // Delay hiding to allow click on suggestion
                                                setTimeout(() => setShowSuggestions(false), 200);
                                            }}
                                        />
                                        {isSearchingCustomers && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <Loader2 className="animate-spin text-gray-400" size={16} />
                                            </div>
                                        )}
                                        {showSuggestions && customerSuggestions.length > 0 && (
                                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto">
                                                {customerSuggestions.map(customer => (
                                                    <div 
                                                        key={customer._id || customer.id}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            handleSelectCustomer(customer);
                                                        }}
                                                        className="p-3 hover:bg-purple-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <p className="font-medium text-gray-900">{customer.name}</p>
                                                        <p className="text-xs text-gray-500">{customer.phone || 'No phone'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {showSuggestions && customerSearchTerm.length >= 2 && customerSuggestions.length === 0 && !isSearchingCustomers && (
                                            <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 p-3">
                                                <p className="text-sm text-gray-500">No customers found</p>
                                            </div>
                                        )}
                                    </div>
                                    {editingOrder.customer && (
                                        <div className="mt-2 text-xs text-gray-600">
                                            Selected: <span className="font-semibold">{editingOrder.customer}</span>
                                            {editingOrder.phone && <span className="ml-2">({editingOrder.phone})</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item</label>
                                    <InputField 
                                        value={editingOrder.item} 
                                        onChange={(e) => setEditingOrder({...editingOrder, item: e.target.value})} 
                                        placeholder="e.g. Shirt, Suit"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Worker Assignments</label>
                                <div className="space-y-3">
                                    {editingOrder.workers.map((worker, index) => (
                                        <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold">Worker</label>
                                                <SelectField 
                                                    value={worker.name} 
                                                    onChange={(e) => updateWorkerInOrder(index, {...worker, name: e.target.value})}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="">Select Worker</option>
                                                    {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                                                </SelectField>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold">Task</label>
                                                <SelectField 
                                                    value={worker.task} 
                                                    onChange={(e) => updateWorkerInOrder(index, {...worker, task: e.target.value as any})}
                                                    disabled={isSubmitting}
                                                >
                                                    <option value="Cutting">Cutting</option>
                                                    <option value="Stitching">Stitching</option>
                                                </SelectField>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] font-bold">Commission</label>
                                                <InputField 
                                                    type="number" 
                                                    value={worker.commission} 
                                                    onChange={(e) => updateWorkerInOrder(index, {...worker, commission: Number(e.target.value)})}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <button 
                                                onClick={() => removeWorkerFromOrder(index)} 
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                disabled={isSubmitting}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={addWorkerToOrder} 
                                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg text-sm font-medium hover:bg-gray-100 hover:border-gray-400"
                                        disabled={isSubmitting}
                                    >
                                        Add another worker
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Update Status</label>
                                    <SelectField 
                                        value={editingOrder.status} 
                                        onChange={(e) => setEditingOrder({...editingOrder, status: e.target.value as any})}
                                        disabled={isSubmitting}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Cutting">Cutting</option>
                                        <option value="Stitching">Stitching</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Ready">Ready</option>
                                        <option value="Delivered">Delivered</option>
                                    </SelectField>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Delivery Date</label>
                                    <InputField 
                                        type="date" 
                                        value={editingOrder.delivery_date || ''} 
                                        onChange={(e) => setEditingOrder({...editingOrder, delivery_date: e.target.value})}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-100 flex justify-end gap-3 border-t border-gray-200 rounded-b-xl mt-auto">
                            <button 
                                onClick={() => setEditingOrder(null)} 
                                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg text-sm"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdateOrder} 
                                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg text-sm hover:bg-purple-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                {editingOrder.id === 0 ? 'Create Order' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="font-bold text-xl text-gray-900">Order Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Track status and delivery dates</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <InputField 
                            placeholder="Search orders..." 
                            className="pl-10 w-64" 
                            value={searchTerm} 
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }} 
                        />
                    </div>
                    <button 
                        onClick={handleNewOrder} 
                        className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md"
                    >
                        <Plus size={18} /> New Order
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                        <p className="text-lg font-medium">No orders found</p>
                        <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Create your first order to get started'}</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-[#312161] text-white text-xs uppercase tracking-wider font-semibold sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Item</th>
                                <th className="px-6 py-4">Workers</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Delivery</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-purple-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-800">#{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{order.customer}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-700">{order.item}</td>
                                    <td className="px-6 py-4 text-gray-600 text-sm">
                                        {order.workers.length > 0 ? order.workers.map(w => w.name.split(' ')[0]).join(', ') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 
                                            order.status === 'Ready' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                            order.status === 'Cutting' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 
                                            order.status === 'Stitching' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 
                                            order.status === 'Delivered' ? 'bg-gray-100 text-gray-600 border border-gray-200' : 
                                            'bg-blue-100 text-blue-700 border border-blue-200'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-700">{order.delivery_date || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setViewingOrder(order)} 
                                                className="text-gray-400 hover:text-purple-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-purple-50" 
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setEditingOrder(order);
                                                    // Set customer search term when editing
                                                    setCustomerSearchTerm(order.customer || '');
                                                    setCustomerSuggestions([]);
                                                    setShowSuggestions(false);
                                                }} 
                                                className="text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-blue-50" 
                                                title="Edit Order"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteOrder(order)} 
                                                className="text-gray-400 hover:text-red-600 transition-colors bg-gray-50 p-2 rounded-full hover:bg-red-50" 
                                                title="Delete Order"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};/*/

