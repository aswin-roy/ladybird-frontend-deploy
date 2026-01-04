/*import React, { useState, useEffect } from 'react';
import { ViewState, Customer } from '../types/types';
import { InputField, Pagination } from '../components';
import { customerService } from '../services/customerService';
import { Plus, Search, X, Trash2, Edit2, ShoppingCart, Ruler, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Customers: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer>({ id: 0, name: '', phone: '', orders: 0, address: '' });
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await customerService.getAll();
            setCustomers(data.sort((a, b) => b.id - a.id));
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load customers');
            console.error('Error loading customers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCustomer = async () => {
        if (!currentCustomer.name || !currentCustomer.phone) {
            alert('Name and Phone are required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            if (modalMode === 'add') {
                await customerService.create({
                    name: currentCustomer.name,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                });
            } else {
                await customerService.update({
                    id: currentCustomer._id || currentCustomer.id,
                    name: currentCustomer.name,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                });
            }

            setIsModalOpen(false);
            setCurrentCustomer({ id: 0, name: '', phone: '', orders: 0, address: '' });
            await loadCustomers();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save customer');
            alert(apiError.message || 'Failed to save customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        try {
            setError(null);
            await customerService.delete(id);
            setIsModalOpen(false);
            await loadCustomers();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to delete customer');
            alert(apiError.message || 'Failed to delete customer');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) return;

        try {
            setError(null);
            await customerService.bulkDelete(selectedIds);
            setSelectedIds([]);
            await loadCustomers();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to delete customers');
            alert(apiError.message || 'Failed to delete customers');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(nextId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setCurrentCustomer({ id: 0, name: '', phone: '', orders: 0, address: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        console.log('Opening edit modal for customer:', customer);
        setModalMode('edit');
        setCurrentCustomer({ ...customer });
        setIsModalOpen(true);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.phone.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredCustomers.map(c => c.id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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

            {isModalOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-all">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-96 border border-gray-200 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900">{modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <InputField
                                    id="customer-name"
                                    placeholder="Customer Name"
                                    value={currentCustomer.name}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                                    onKeyDown={(e) => handleKeyDown(e, 'customer-phone')}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                <InputField
                                    id="customer-phone"
                                    placeholder="Phone Number"
                                    value={currentCustomer.phone}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                                    onKeyDown={(e) => handleKeyDown(e, 'customer-address')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                <InputField
                                    id="customer-address"
                                    placeholder="Address"
                                    value={currentCustomer.address || ''}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveCustomer();
                                        }
                                    }}
                                />
                            </div>
                            <div className="pt-4 flex justify-between items-center gap-2">
                                {modalMode === 'edit' ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCustomer(currentCustomer.id)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition flex items-center gap-1"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                ) : <div></div>}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveCustomer}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-md shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                        {modalMode === 'add' ? 'Save Customer' : 'Update Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center w-full justify-between bg-purple-50 p-2 -m-2 rounded-lg border border-purple-100">
                        <div className="flex items-center px-3">
                            <span className="font-bold text-purple-900">{selectedIds.length} Selected</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 flex items-center gap-2">
                                <Trash2 size={16} /> Delete Selected
                            </button>
                            <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-gray-500 hover:text-gray-700"><X size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Customers</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage your client database</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <InputField
                                    placeholder="Search customers..."
                                    className="pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                    }}
                                />
                            </div>
                            <button
                                onClick={openAddModal}
                                className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition shadow-md shadow-purple-200 font-medium text-sm"
                            >
                                <Plus size={18} /> Add Customer
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="overflow-auto flex-1">
                {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                        <p className="text-lg font-medium">No customers found</p>
                        <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first customer to get started'}</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedCustomers.map((customer) => (
                                <tr key={customer.id} className={`hover:bg-purple-50/50 transition-colors group ${selectedIds.includes(customer.id) ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(customer.id)}
                                            onChange={() => handleSelect(customer.id)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3 group-hover:from-purple-100 group-hover:to-purple-200 group-hover:text-purple-700 transition-colors">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                            {customer.orders} orders
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{customer.address || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onNavigate('salesEntry')}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="New Sale"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                            <button
                                                onClick={() => onNavigate('measurements')}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Measurements"
                                            >
                                                <Ruler size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
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
import React, { useState, useEffect } from 'react';
import { ViewState, Customer } from '../types/types';
import { InputField, Pagination } from '../components';
import { customerService } from '../services/customerService';
import { Plus, Search, X, Trash2, Edit2, ShoppingCart, Ruler, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Customers: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer>({ id: 0, name: '', phone: '', orders: 0, address: '' });
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await customerService.getAll();
            setCustomers(data.sort((a, b) => b.id - a.id));
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load customers');
            console.error('Error loading customers:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCustomer = async () => {
        if (!currentCustomer.name || !currentCustomer.phone) {
            alert('Name and Phone are required');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            if (modalMode === 'add') {
                await customerService.create({
                    name: currentCustomer.name,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                });
            } else {
                await customerService.update({
                    id: currentCustomer._id || currentCustomer.id,
                    name: currentCustomer.name,
                    phone: currentCustomer.phone,
                    address: currentCustomer.address,
                });
            }

            setIsModalOpen(false);
            setCurrentCustomer({ id: 0, name: '', phone: '', orders: 0, address: '' });
            await loadCustomers();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save customer');
            alert(apiError.message || 'Failed to save customer');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCustomer = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;

        try {
            setError(null);
            await customerService.delete(id);
            setIsModalOpen(false);
            await loadCustomers();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to delete customer');
            alert(apiError.message || 'Failed to delete customer');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} customers?`)) return;

        try {
            setError(null);
            await customerService.bulkDelete(selectedIds);
            setSelectedIds([]);
            await loadCustomers();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to delete customers');
            alert(apiError.message || 'Failed to delete customers');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, nextId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(nextId);
            if (nextInput) {
                nextInput.focus();
            }
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setCurrentCustomer({ id: 0, name: '', phone: '', orders: 0, address: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (customer: Customer) => {
        console.log('Opening edit modal for customer:', customer);
        setModalMode('edit');
        setCurrentCustomer({ ...customer });
        setIsModalOpen(true);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.phone.includes(searchTerm)
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedIds(filteredCustomers.map(c => c._id!).filter(id => id));
        else setSelectedIds([]);
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
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

            {isModalOpen && (
                <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-all">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-96 border border-gray-200 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-900">{modalMode === 'add' ? 'Add New Customer' : 'Edit Customer'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <InputField
                                    id="customer-name"
                                    placeholder="Customer Name"
                                    value={currentCustomer.name}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, name: e.target.value })}
                                    onKeyDown={(e) => handleKeyDown(e, 'customer-phone')}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                <InputField
                                    id="customer-phone"
                                    placeholder="Phone Number"
                                    value={currentCustomer.phone}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
                                    onKeyDown={(e) => handleKeyDown(e, 'customer-address')}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                                <InputField
                                    id="customer-address"
                                    placeholder="Address"
                                    value={currentCustomer.address || ''}
                                    onChange={(e) => setCurrentCustomer({ ...currentCustomer, address: e.target.value })}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSaveCustomer();
                                        }
                                    }}
                                />
                            </div>
                            <div className="pt-4 flex justify-between items-center gap-2">
                                {modalMode === 'edit' ? (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCustomer(currentCustomer._id!)}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition flex items-center gap-1"
                                        disabled={isSubmitting}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                ) : <div></div>}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveCustomer}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition shadow-md shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                        {modalMode === 'add' ? 'Save Customer' : 'Update Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                {selectedIds.length > 0 ? (
                    <div className="flex items-center w-full justify-between bg-purple-50 p-2 -m-2 rounded-lg border border-purple-100">
                        <div className="flex items-center px-3">
                            <span className="font-bold text-purple-900">{selectedIds.length} Selected</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleBulkDelete} className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 flex items-center gap-2">
                                <Trash2 size={16} /> Delete Selected
                            </button>
                            <button onClick={() => setSelectedIds([])} className="px-3 py-1.5 text-gray-500 hover:text-gray-700"><X size={18} /></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">Customers</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage your client database</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <InputField
                                    placeholder="Search customers..."
                                    className="pl-10 w-64"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                    }}
                                />
                            </div>
                            <button
                                onClick={openAddModal}
                                className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition shadow-md shadow-purple-200 font-medium text-sm"
                            >
                                <Plus size={18} /> Add Customer
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="overflow-auto flex-1">
                {filteredCustomers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                        <p className="text-lg font-medium">No customers found</p>
                        <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first customer to get started'}</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedCustomers.map((customer) => (
                                <tr key={customer._id || customer.id} className={`hover:bg-purple-50/50 transition-colors group ${selectedIds.includes(customer._id!) ? 'bg-purple-50/30' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(customer._id!)}
                                            onChange={() => handleSelect(customer._id!)}
                                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3 group-hover:from-purple-100 group-hover:to-purple-200 group-hover:text-purple-700 transition-colors">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900">{customer.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{customer.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                            {customer.orders} orders
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">{customer.address || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => onNavigate('salesEntry')}
                                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                title="New Sale"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                            <button
                                                onClick={() => onNavigate('measurements')}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Measurements"
                                            >
                                                <Ruler size={18} />
                                            </button>
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
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


