/*import React, { useState, useEffect } from 'react';
import { ViewState } from '../types/types';
import { InputField } from '../components/InputField';
import { measurementService } from '../services/measurementService';
import { Search, Plus, X, History, ArrowLeft, Printer, Save, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';
import { Measurement } from '../services/measurementService';
import { customerService } from '../services/customerService';
import { Customer } from '../types/types';

export const Measurements: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [selectedHistory, setSelectedHistory] = useState<Measurement[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState(''); // New state for notes <!-- id: 22 -->

    // New state for customer search
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    useEffect(() => {
        if (viewMode === 'form') {
            loadCustomers();
        }
    }, [viewMode]);

    const loadCustomers = async () => {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (err) {
            console.error('Error loading customers:', err);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerName.toLowerCase()) ||
        c.phone.includes(customerName)
    );

    const upperBodyFields = ["Blouse Length", "Shoulder", "Chest", "Upper Chest", "Waist", "Hip", "Sleeve Length", "Sleeve Round", "Arm Hole", "Front Neck", "Back Neck"];
    const lowerBodyFields = ["Pant Length", "Waist Round", "Hip Round", "Thigh", "Knee", "Calf", "Bottom", "Crotch"];

    useEffect(() => {
        if (viewMode === 'list') {
            loadMeasurements();
        }
    }, [viewMode]);

    const loadMeasurements = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await measurementService.getAll();
            setMeasurements(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load measurements');
            console.error('Error loading measurements:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!customerName) {
            alert('Please enter customer name');
            return;
        }

        if (!customerId) {
            alert('Please select a customer');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await measurementService.create({
                customer_id: customerId,
                customer_name: customerName,
                measurement_date: new Date().toISOString().split('T')[0],
                values: formData,
                notes: notes, // Include notes <!-- id: 23 -->
            });
            alert('Measurements Saved!');
            setViewMode('list');
            setFormData({});
            setCustomerName('');
            setCustomerId(null);
            setNotes(''); // Reset notes <!-- id: 24 -->
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save measurements');
            alert(apiError.message || 'Failed to save measurements');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewHistory = async (customerId: string, customerName: string) => {
        try {
            setError(null);
            const history = await measurementService.getByCustomer(customerId);
            setSelectedHistory(history);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load history');
            alert(apiError.message || 'Failed to load history');
        }
    };

    const filteredMeasurements = measurements.filter(m =>
        m.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const uniqueCustomers = Array.from(new Set(measurements.map(m => m.customer_id)))
        .map(id => {
            const customerMeasurements = measurements.filter(m => m.customer_id === id);
            return customerMeasurements.sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime())[0];
        })
        .filter(m => m.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = () => {
        window.print();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, section: 'upper' | 'lower') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(`${section}-${index + 1}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        }
    };

    if (isLoading && viewMode === 'list') {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)]">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4">
                        {error}
                    </div>
                )}

                {selectedHistory && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-100 rounded-t-xl">
                                <h3 className="font-bold text-lg">History: {selectedHistory[0]?.customer_name}</h3>
                                <button onClick={() => setSelectedHistory(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto space-y-4">
                                {selectedHistory.map((h) => (
                                    <div key={h.id} className="border p-4 rounded-lg bg-gray-50">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-sm text-gray-600">{h.measurement_date}</span>
                                            <button
                                                onClick={() => {
                                                    setFormData(h.values);
                                                    setCustomerName(h.customer_name);
                                                    setCustomerId(h.customer_id);
                                                    setNotes(h.notes || ''); // Populate notes from history <!-- id: 25 -->
                                                    setViewMode('form');
                                                    setSelectedHistory(null);
                                                }}
                                                className="text-purple-600 text-xs font-bold hover:underline"
                                            >
                                                Edit / Use
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            {Object.entries(h.values).map(([k, v]) => (
                                                <div key={k}>
                                                    <span className="text-gray-500">{k}:</span> <span className="font-medium">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-xl text-gray-900">Measurements</h3>
                        <p className="text-sm text-gray-500">Manage customer size charts</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <InputField
                                placeholder="Search customer..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setCustomerName('');
                                setCustomerId(null);
                                setFormData({});
                                setViewMode('form');
                            }}
                            className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md"
                        >
                            <Plus size={18} /> New Measurement
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {uniqueCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                            <p className="text-lg font-medium">No measurements found</p>
                            <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first measurement to get started'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uniqueCustomers.map(m => (
                                <div key={m.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold mr-3">
                                                {m.customer_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{m.customer_name}</h4>
                                                <p className="text-xs text-gray-500">Last updated: {m.measurement_date}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewHistory(m.customer_id, m.customer_name)}
                                            className="text-gray-400 hover:text-purple-600"
                                        >
                                            <History size={18} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                                        {Object.entries(m.values).slice(0, 4).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="text-gray-500 text-xs">{k}</span>
                                                <span className="font-medium">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCustomerName(m.customer_name);
                                            setCustomerId(m.customer_id);
                                            setFormData(m.values);
                                            setNotes(m.notes || ''); // Populate notes for edit <!-- id: 26 -->
                                            setViewMode('form');
                                        }}
                                        className="w-full py-2 border border-purple-200 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors"
                                    >
                                        Edit / Update
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 relative">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-measurement-sheet, #printable-measurement-sheet * { visibility: visible; }
                    #printable-measurement-sheet { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="flex justify-between items-center mb-6 no-print">
                <button
                    onClick={() => setViewMode('list')}
                    className="flex items-center text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                        <Save size={18} /> Save Measurement
                    </button>
                </div>
            </div>

            <div id="printable-measurement-sheet" className="p-4">
                <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-center text-purple-900 mb-4">MEASUREMENT CHART</h2>
                    <div className="relative">
                        <label className="font-bold text-gray-700 block mb-1 text-center">Customer Name:</label>
                        <div className="relative w-64">
                            <input
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    setIsCustomerDropdownOpen(true);
                                    if (!e.target.value) setCustomerId(null);
                                }}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                                className="border-b-2 border-gray-300 focus:border-purple-600 outline-none px-2 py-1 text-lg font-medium text-center w-full bg-transparent"
                                placeholder="Search Customer"
                            />
                            {isCustomerDropdownOpen && customerName && !customerId && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto text-left">
                                    {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                        <div
                                            key={c.id}
                                            onMouseDown={() => {
                                                setCustomerName(c.name);
                                                setCustomerId(c._id || '');
                                                setIsCustomerDropdownOpen(false);
                                            }}
                                            className="p-3 hover:bg-purple-50 cursor-pointer text-sm"
                                        >
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.phone}</p>
                                        </div>
                                    )) : <div className="p-3 text-sm text-gray-500">No customer found.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-purple-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Upper Body</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {upperBodyFields.map((field, index) => (
                                <div key={field}>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{field}</label>
                                    <input
                                        id={`upper-${index}`}
                                        value={formData[field] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        onKeyDown={(e) => handleKeyDown(e, index, 'upper')}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none text-center font-medium"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-purple-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Lower Body</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {lowerBodyFields.map((field, index) => (
                                <div key={field}>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{field}</label>
                                    <input
                                        id={`lower-${index}`}
                                        value={formData[field] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        onKeyDown={(e) => handleKeyDown(e, index, 'lower')}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none text-center font-medium"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-4 no-print">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notes / Design Details</label>
                    <textarea
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        rows={4}
                        placeholder="Add specific design notes here..."
                        value={notes} // Bind to state <!-- id: 27 -->
                        onChange={(e) => setNotes(e.target.value)} // Update state on change <!-- id: 28 -->
                    ></textarea>
                </div>
            </div>
        </div>
    );
};/*/





import React, { useState, useEffect } from 'react';
import { ViewState } from '../types/types';
import { InputField } from '../components/InputField';
import { measurementService } from '../services/measurementService';
import { Search, Plus, X, History, ArrowLeft, Printer, Save, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';
import { Measurement } from '../services/measurementService';
import { customerService } from '../services/customerService';
import { Customer } from '../types/types';

export const Measurements: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [customerName, setCustomerName] = useState('');
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [selectedHistory, setSelectedHistory] = useState<Measurement[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notes, setNotes] = useState('');

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    useEffect(() => {
        if (viewMode === 'form') {
            loadCustomers();
        }
    }, [viewMode]);

    const loadCustomers = async () => {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch (err) {
            console.error('Error loading customers:', err);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerName.toLowerCase()) ||
        c.phone.includes(customerName)
    );

    const upperBodyFields = [
        "Blouse Length", "Shoulder", "Chest", "Upper Chest", "Waist", "Hip",
        "Sleeve Length", "Sleeve Round", "Arm Hole", "Front Neck", "Back Neck",
        "Point Length", "Point Width", "Top Length", "Slide Open Length",
        "York Length", "Collar", "Shirt Length"
    ];
    const lowerBodyFields = [
        "Pant Length", "Waist Round", "Hip Round", "Thigh", "Knee", "Calf",
        "Bottom", "Crotch", "Skirt Length"
    ];

    useEffect(() => {
        if (viewMode === 'list') {
            loadMeasurements();
        }
    }, [viewMode]);

    const loadMeasurements = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await measurementService.getAll();
            setMeasurements(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load measurements');
            console.error('Error loading measurements:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!customerName) {
            alert('Please enter customer name');
            return;
        }

        if (!customerId) {
            alert('Please select a customer');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await measurementService.create({
                customer_id: customerId,
                customer_name: customerName,
                measurement_date: new Date().toISOString().split('T')[0],
                values: formData,
                notes: notes,
            });
            alert('Measurements Saved!');
            setViewMode('list');
            setFormData({});
            setCustomerName('');
            setCustomerId(null);
            setNotes('');
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to save measurements');
            alert(apiError.message || 'Failed to save measurements');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewHistory = async (id: string, name: string) => {
        try {
            setError(null);
            const history = await measurementService.getByCustomer(id);
            setSelectedHistory(history);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load history');
        }
    };

    const uniqueCustomers = Array.from(new Set(measurements.map(m => m.customer_id)))
        .map(id => {
            const customerMeasurements = measurements.filter(m => m.customer_id === id);
            return customerMeasurements.sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime())[0];
        })
        .filter(m => m.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handlePrint = () => {
        window.print();
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, section: 'upper' | 'lower') => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextInput = document.getElementById(`${section}-${index + 1}`);
            if (nextInput) {
                (nextInput as HTMLInputElement).focus();
            }
        }
    };

    if (isLoading && viewMode === 'list') {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-8rem)]">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-4">
                        {error}
                    </div>
                )}

                {selectedHistory && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-100 rounded-t-xl">
                                <h3 className="font-bold text-lg">History: {selectedHistory[0]?.customer_name}</h3>
                                <button onClick={() => setSelectedHistory(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-4 overflow-y-auto space-y-4">
                                {selectedHistory.map((h) => (
                                    <div key={h.id} className="border p-4 rounded-lg bg-gray-50">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-sm text-gray-600">{h.measurement_date}</span>
                                            <button
                                                onClick={() => {
                                                    setFormData(h.values);
                                                    setCustomerName(h.customer_name);
                                                    setCustomerId(h.customer_id);
                                                    setNotes(h.notes || '');
                                                    setViewMode('form');
                                                    setSelectedHistory(null);
                                                }}
                                                className="text-purple-600 text-xs font-bold hover:underline"
                                            >
                                                Edit / Use
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            {Object.entries(h.values).map(([k, v]) => (
                                                <div key={k}>
                                                    <span className="text-gray-500">{k}:</span> <span className="font-medium">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-xl text-gray-900">Measurements</h3>
                        <p className="text-sm text-gray-500">Manage customer size charts</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <InputField
                                placeholder="Search customer..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setCustomerName('');
                                setCustomerId(null);
                                setFormData({});
                                setNotes('');
                                setViewMode('form');
                            }}
                            className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md"
                        >
                            <Plus size={18} /> New Measurement
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {uniqueCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                            <p className="text-lg font-medium">No measurements found</p>
                            <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first measurement to get started'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {uniqueCustomers.map(m => (
                                <div key={m.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-gray-50">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold mr-3">
                                                {m.customer_name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{m.customer_name}</h4>
                                                <p className="text-xs text-gray-500">Last updated: {m.measurement_date}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleViewHistory(m.customer_id, m.customer_name)}
                                            className="text-gray-400 hover:text-purple-600"
                                        >
                                            <History size={18} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3 bg-gray-50 p-3 rounded-lg">
                                        {Object.entries(m.values).slice(0, 4).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="text-gray-500 text-xs">{k}</span>
                                                <span className="font-medium">{v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setCustomerName(m.customer_name);
                                            setCustomerId(m.customer_id);
                                            setFormData(m.values);
                                            setNotes(m.notes || '');
                                            setViewMode('form');
                                        }}
                                        className="w-full py-2 border border-purple-200 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors"
                                    >
                                        Edit / Update
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 relative">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-measurement-sheet, #printable-measurement-sheet * { visibility: visible; }
                    #printable-measurement-sheet { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="flex justify-between items-center mb-6 no-print">
                <button
                    onClick={() => setViewMode('list')}
                    className="flex items-center text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </button>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <Printer size={18} /> Print
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                        <Save size={18} /> Save Measurement
                    </button>
                </div>
            </div>

            <div id="printable-measurement-sheet" className="p-4">
                <div className="mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-center text-purple-900 mb-4">MEASUREMENT CHART</h2>
                    <div className="flex flex-col items-center gap-2">
                        <label className="font-bold text-gray-700">Customer Name:</label>
                        <div className="relative w-full max-w-sm">
                            <input
                                value={customerName}
                                onChange={(e) => {
                                    setCustomerName(e.target.value);
                                    setIsCustomerDropdownOpen(true);
                                    if (!e.target.value) setCustomerId(null);
                                }}
                                onFocus={() => setIsCustomerDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                                className="border-b-2 border-gray-300 focus:border-purple-600 outline-none px-2 py-1 text-lg font-medium text-center w-full bg-transparent"
                                placeholder="Search Customer"
                            />
                            {isCustomerDropdownOpen && customerName && !customerId && (
                                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto text-left">
                                    {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                        <div
                                            key={c.id}
                                            onMouseDown={() => {
                                                setCustomerName(c.name);
                                                setCustomerId(c._id || '');
                                                setIsCustomerDropdownOpen(false);
                                            }}
                                            className="p-3 hover:bg-purple-50 cursor-pointer text-sm"
                                        >
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-xs text-gray-500">{c.phone}</p>
                                        </div>
                                    )) : <div className="p-3 text-sm text-gray-500">No customer found.</div>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-purple-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Upper Body</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {upperBodyFields.map((field, index) => (
                                <div key={field}>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{field}</label>
                                    <input
                                        id={`upper-${index}`}
                                        value={formData[field] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        onKeyDown={(e) => handleKeyDown(e, index, 'upper')}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none text-center font-medium"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <h3 className="font-bold text-purple-900 mb-4 uppercase tracking-wider text-sm border-b pb-2">Lower Body</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {lowerBodyFields.map((field, index) => (
                                <div key={field}>
                                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">{field}</label>
                                    <input
                                        id={`lower-${index}`}
                                        value={formData[field] || ''}
                                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        onKeyDown={(e) => handleKeyDown(e, index, 'lower')}
                                        className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none text-center font-medium"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-4 no-print">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Notes / Design Details</label>
                    <textarea
                        className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        rows={4}
                        placeholder="Add specific design notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                </div>
            </div>
        </div>
    );
};





