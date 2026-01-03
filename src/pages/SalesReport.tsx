/*import React, { useState, useEffect } from 'react';
import { ViewState, Bill, InvoiceDetails } from '../types/types';
import { InputField, Pagination, StatCard } from '../components';
import { billService } from '../services/billService';
import { Search, X, Printer, CreditCard, DollarSign, ShoppingCart, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const SalesReport: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [salesBills, setSalesBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filterPeriod, setFilterPeriod] = useState<'daily' | 'monthly'>('monthly');
    const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
    const [monthFilter, setMonthFilter] = useState<string>(new Date().toISOString().slice(0, 7));

    const itemsPerPage = 10;

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await billService.getAll();
            setSalesBills(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load bills');
            console.error('Error loading bills:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const dateFilteredBills = salesBills.filter(bill => {
        if (filterPeriod === 'daily') {
            return bill.date === dateFilter;
        } else {
            return bill.date.startsWith(monthFilter);
        }
    });

    const finalFilteredBills = dateFilteredBills.filter(bill =>
        bill.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.phone && bill.phone.includes(searchTerm)) ||
        bill.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = finalFilteredBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const pendingAmount = finalFilteredBills.reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
    const totalOrders = finalFilteredBills.length;

    const totalPages = Math.ceil(finalFilteredBills.length / itemsPerPage);
    const paginatedBills = finalFilteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openPaymentModal = (bill: Bill) => {
        setSelectedBill(bill);
        setPaymentAmount('');
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedBill) return;
        const amountToAdd = parseFloat(paymentAmount);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await billService.addPayment({
                bill_id: parseInt(selectedBill.bill_no.replace('B', '')),
                amount: amountToAdd,
                paymentMode: selectedBill.paymentMode,
            });
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
            setPaymentAmount('');
            await loadBills();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to add payment');
            alert(apiError.message || 'Failed to add payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openPrintModal = async (bill: Bill) => {
        setSelectedBill(bill);
        setIsPrintModalOpen(true);
        if (bill._id) {
            setIsLoadingInvoice(true);
            try {
                const response = await billService.getInvoiceForPrint(bill._id);
                setInvoiceDetails(response.data);
            } catch (error) {
                console.error("Failed to load invoice details", error);
                // Fallback or error handling
            } finally {
                setIsLoadingInvoice(false);
            }
        }
    };

    const handlePrint = (size: 'A4' | 'A5') => {
        const printContent = document.getElementById('print-preview-content');
        if (printContent) {
            if (size === 'A5') {
                printContent.style.width = '148mm';
                printContent.style.minHeight = '210mm';
            } else {
                printContent.style.width = '100%';
                printContent.style.minHeight = 'auto';
            }
        }
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-preview-content, #print-preview-content * { visibility: visible; }
                    #print-preview-content { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100% !important;
                        margin: 0;
                        padding: 20px;
                        box-shadow: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {isPaymentModalOpen && selectedBill && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Add Payment</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Bill:</span>
                                <span className="font-bold">₹{selectedBill.amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Already Paid:</span>
                                <span className="font-bold text-green-600">₹{selectedBill.paidAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pending Balance:</span>
                                <span className="font-bold text-red-600">₹{selectedBill.amount - (selectedBill.paidAmount || 0)}</span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Payment Amount</label>
                                <InputField
                                    type="number"
                                    placeholder="Enter amount"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                Update Balance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPrintModalOpen && selectedBill && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 w-full max-w-lg shadow-2xl rounded-xl overflow-hidden flex flex-col h-[90vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100 no-print">
                            <h3 className="font-bold text-lg text-gray-900">Print Invoice</h3>
                            <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
                            <div id="print-preview-content" className="bg-gray-50 shadow-lg p-8 w-full max-w-md text-sm flex flex-col h-full sm:h-auto">
                                {isLoadingInvoice ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="animate-spin text-purple-600" size={32} />
                                    </div>
                                ) : invoiceDetails ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <h1 className="text-xl font-bold text-purple-900">LADYBIRD</h1>
                                            <p className="text-gray-500">INVOICE #{invoiceDetails.billNo}</p>
                                        </div>
                                        <div className="mb-6 border-b border-gray-100 pb-4">
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div>
                                                    <p className="font-bold">Customer Details:</p>
                                                    <p className="text-gray-900">{invoiceDetails.customer.name}</p>
                                                    <p className="text-gray-500">{invoiceDetails.customer.phone}</p>
                                                    {invoiceDetails.customer.address && <p className="text-gray-500">{invoiceDetails.customer.address}</p>}
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="font-bold">Invoice Details:</p>
                                                    <p className="text-gray-500">Date: {new Date(invoiceDetails.date).toLocaleDateString()}</p>
                                                    <p className="text-gray-500">Mode: {invoiceDetails.payment.method}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <table className="w-full mb-6 border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                                                    <th className="py-2">#</th>
                                                    <th className="py-2">Description</th>
                                                    <th className="py-2 text-right">Qty</th>
                                                    <th className="py-2 text-right">Rate</th>
                                                    <th className="py-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {invoiceDetails.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="py-2 text-gray-500">{index + 1}</td>
                                                        <td className="py-2 font-medium text-gray-900">{item.product}</td>
                                                        <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                                                        <td className="py-2 text-right text-gray-600">₹{item.rate}</td>
                                                        <td className="py-2 text-right font-bold text-gray-800">₹{item.amount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="border-t border-gray-200 pt-4 space-y-2 mt-auto">
                                            <div className="flex justify-between">
                                                <span>Total Amount:</span>
                                                <span className="font-bold">₹{invoiceDetails.payment.total}</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Paid:</span>
                                                <span>₹{invoiceDetails.payment.paid}</span>
                                            </div>
                                            <div className="flex justify-between text-red-600 text-lg font-bold">
                                                <span>Balance Due:</span>
                                                <span>₹{invoiceDetails.payment.pending}</span>
                                            </div>
                                        </div>
                                        {invoiceDetails.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                                <p className="font-bold mb-1">Notes:</p>
                                                <p>{invoiceDetails.notes}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        Failed to load invoice details.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center no-print">
                            <div className="flex gap-2">
                                <button onClick={() => handlePrint('A4')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                    Print A4
                                </button>
                                <button onClick={() => handlePrint('A5')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                    Print A5
                                </button>
                            </div>
                            <button onClick={() => window.print()} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-purple-700">
                                <Printer size={16} /> Quick Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 no-print">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Sales Report</h2>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setFilterPeriod('daily')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'daily' ? 'bg-gray-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setFilterPeriod('monthly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'monthly' ? 'bg-gray-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                        {filterPeriod === 'daily' ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Date:</span>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Month:</span>
                                <input
                                    type="month"
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <InputField
                            placeholder="Search Report..."
                            className="pl-9 w-full md:w-64 py-1.5 text-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                <StatCard title="Total Revenue" value={`₹${totalRevenue}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Orders Count" value={totalOrders} icon={ShoppingCart} color="bg-blue-500" />
                <StatCard title="Outstanding Balance" value={`₹${pendingAmount}`} icon={AlertCircle} color="bg-red-500" />
            </div>

            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[500px] no-print">
                <h3 className="font-bold text-lg text-gray-900 mb-6">
                    Transaction History <span className="text-sm font-normal text-gray-500 ml-2">
                        ({filterPeriod === 'daily' ? dateFilter : monthFilter})
                    </span>
                </h3>

                {paginatedBills.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>No transactions found for this period.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Bill No</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Phone</th>
                                        <th className="px-6 py-3">Mode</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 text-right text-green-600">Paid</th>
                                        <th className="px-6 py-3 text-right text-red-600">Pending</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedBills.map((bill, i) => {
                                        const paid = bill.paidAmount || 0;
                                        const pending = bill.amount - paid;
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500">{bill.date}</td>
                                                <td className="px-6 py-4 font-medium text-purple-600">{bill.bill_no}</td>
                                                <td className="px-6 py-4 text-gray-900">{bill.customer}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{bill.phone || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{bill.paymentMode}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">₹{bill.amount}</td>
                                                <td className="px-6 py-4 text-right font-medium text-green-600">₹{paid}</td>
                                                <td className="px-6 py-4 text-right font-bold text-red-600">₹{pending}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openPaymentModal(bill)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Add Payment / Advance"
                                                    >
                                                        <CreditCard size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openPrintModal(bill)}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};/*/




import React, { useState, useEffect } from 'react';
import { ViewState, Bill, InvoiceDetails } from '../types/types';
import { InputField, Pagination, StatCard } from '../components';
import { billService } from '../services/billService';
import { Search, X, Printer, CreditCard, DollarSign, ShoppingCart, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const SalesReport: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [salesBills, setSalesBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
    const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paymentAmount, setPaymentAmount] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [filterPeriod, setFilterPeriod] = useState<'daily' | 'monthly'>('monthly');
    const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
    const [monthFilter, setMonthFilter] = useState<string>(new Date().toISOString().slice(0, 7));

    const itemsPerPage = 10;

    useEffect(() => {
        loadBills();
    }, []);

    const loadBills = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await billService.getAll();
            setSalesBills(data);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load bills');
            console.error('Error loading bills:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const dateFilteredBills = salesBills.filter(bill => {
        if (filterPeriod === 'daily') {
            return bill.date === dateFilter;
        } else {
            return bill.date.startsWith(monthFilter);
        }
    });

    const finalFilteredBills = dateFilteredBills.filter(bill =>
        bill.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bill.phone && bill.phone.includes(searchTerm)) ||
        bill.bill_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = finalFilteredBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
    const pendingAmount = finalFilteredBills.reduce((sum, b) => sum + (b.amount - (b.paidAmount || 0)), 0);
    const totalOrders = finalFilteredBills.length;

    const totalPages = Math.ceil(finalFilteredBills.length / itemsPerPage);
    const paginatedBills = finalFilteredBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const openPaymentModal = (bill: Bill) => {
        setSelectedBill(bill);
        setPaymentAmount('');
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedBill || !selectedBill._id) return;
        const amountToAdd = parseFloat(paymentAmount);
        if (isNaN(amountToAdd) || amountToAdd <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        const currentPaid = selectedBill.paidAmount || 0;
        const newTotalPaid = currentPaid + amountToAdd;

        if (newTotalPaid > selectedBill.amount + 0.1) {
            alert('Paid amount cannot exceed total bill amount');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await billService.addPayment({
                bill_id: selectedBill._id,
                amount: amountToAdd,
                totalPaid: newTotalPaid,
                paymentMode: selectedBill.paymentMode,
            });
            setIsPaymentModalOpen(false);
            setSelectedBill(null);
            setPaymentAmount('');
            await loadBills();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to add payment');
            alert(apiError.message || 'Failed to add payment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openPrintModal = async (bill: Bill) => {
        setSelectedBill(bill);
        setIsPrintModalOpen(true);
        if (bill._id) {
            setIsLoadingInvoice(true);
            try {
                const response = await billService.getInvoiceForPrint(bill._id);
                setInvoiceDetails(response.data);
            } catch (error) {
                console.error("Failed to load invoice details", error);
                // Fallback or error handling
            } finally {
                setIsLoadingInvoice(false);
            }
        }
    };

    const handlePrint = (size: 'A4' | 'A5') => {
        const printContent = document.getElementById('print-preview-content');
        if (printContent) {
            if (size === 'A5') {
                printContent.style.width = '148mm';
                printContent.style.minHeight = '210mm';
            } else {
                printContent.style.width = '100%';
                printContent.style.minHeight = 'auto';
            }
        }
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #print-preview-content, #print-preview-content * { visibility: visible; }
                    #print-preview-content { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100% !important;
                        margin: 0;
                        padding: 20px;
                        box-shadow: none !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {isPaymentModalOpen && selectedBill && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 no-print">
                    <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-lg text-gray-900 mb-4">Add Payment</h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Total Bill:</span>
                                <span className="font-bold">₹{selectedBill.amount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Already Paid:</span>
                                <span className="font-bold text-green-600">₹{selectedBill.paidAmount || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Pending Balance:</span>
                                <span className="font-bold text-red-600">₹{selectedBill.amount - (selectedBill.paidAmount || 0)}</span>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Payment Amount</label>
                                <InputField
                                    type="number"
                                    placeholder="Enter amount"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    autoFocus
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                Update Balance
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPrintModalOpen && selectedBill && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-gray-50 w-full max-w-lg shadow-2xl rounded-xl overflow-hidden flex flex-col h-[90vh]">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100 no-print">
                            <h3 className="font-bold text-lg text-gray-900">Print Invoice</h3>
                            <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-100 p-8 flex justify-center">
                            <div id="print-preview-content" className="bg-gray-50 shadow-lg p-8 w-full max-w-md text-sm flex flex-col h-full sm:h-auto">
                                {isLoadingInvoice ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="animate-spin text-purple-600" size={32} />
                                    </div>
                                ) : invoiceDetails ? (
                                    <>
                                        <div className="text-center mb-6">
                                            <h1 className="text-xl font-bold text-purple-900">LADYBIRD</h1>
                                            <p className="text-gray-500">INVOICE #{invoiceDetails.billNo}</p>
                                        </div>
                                        <div className="mb-6 border-b border-gray-100 pb-4">
                                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                                <div>
                                                    <p className="font-bold">Customer Details:</p>
                                                    <p className="text-gray-900">{invoiceDetails.customer.name}</p>
                                                    <p className="text-gray-500">{invoiceDetails.customer.phone}</p>
                                                    {invoiceDetails.customer.address && <p className="text-gray-500">{invoiceDetails.customer.address}</p>}
                                                </div>
                                                <div className="sm:text-right">
                                                    <p className="font-bold">Invoice Details:</p>
                                                    <p className="text-gray-500">Date: {new Date(invoiceDetails.date).toLocaleDateString()}</p>
                                                    <p className="text-gray-500">Mode: {invoiceDetails.payment.method}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <table className="w-full mb-6 border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                                                    <th className="py-2">#</th>
                                                    <th className="py-2">Description</th>
                                                    <th className="py-2 text-right">Qty</th>
                                                    <th className="py-2 text-right">Rate</th>
                                                    <th className="py-2 text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {invoiceDetails.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="py-2 text-gray-500">{index + 1}</td>
                                                        <td className="py-2 font-medium text-gray-900">{item.product}</td>
                                                        <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                                                        <td className="py-2 text-right text-gray-600">₹{item.rate}</td>
                                                        <td className="py-2 text-right font-bold text-gray-800">₹{item.amount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="border-t border-gray-200 pt-4 space-y-2 mt-auto">
                                            <div className="flex justify-between">
                                                <span>Total Amount:</span>
                                                <span className="font-bold">₹{invoiceDetails.payment.total}</span>
                                            </div>
                                            <div className="flex justify-between text-green-600">
                                                <span>Paid:</span>
                                                <span>₹{invoiceDetails.payment.paid}</span>
                                            </div>
                                            <div className="flex justify-between text-red-600 text-lg font-bold">
                                                <span>Balance Due:</span>
                                                <span>₹{invoiceDetails.payment.pending}</span>
                                            </div>
                                        </div>
                                        {invoiceDetails.notes && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                                <p className="font-bold mb-1">Notes:</p>
                                                <p>{invoiceDetails.notes}</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        Failed to load invoice details.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center no-print">
                            <div className="flex gap-2">
                                <button onClick={() => handlePrint('A4')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                    Print A4
                                </button>
                                <button onClick={() => handlePrint('A5')} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium">
                                    Print A5
                                </button>
                            </div>
                            <button onClick={() => window.print()} className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-purple-700">
                                <Printer size={16} /> Quick Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 no-print">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">Sales Report</h2>
                    </div>

                    <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                        <button
                            onClick={() => setFilterPeriod('daily')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'daily' ? 'bg-gray-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setFilterPeriod('monthly')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filterPeriod === 'monthly' ? 'bg-gray-50 text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                        {filterPeriod === 'daily' ? (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Date:</span>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Month:</span>
                                <input
                                    type="month"
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        )}
                    </div>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <InputField
                            placeholder="Search Report..."
                            className="pl-9 w-full md:w-64 py-1.5 text-sm"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 no-print">
                <StatCard title="Total Revenue" value={`₹${totalRevenue}`} icon={DollarSign} color="bg-emerald-500" />
                <StatCard title="Orders Count" value={totalOrders} icon={ShoppingCart} color="bg-blue-500" />
                <StatCard title="Outstanding Balance" value={`₹${pendingAmount}`} icon={AlertCircle} color="bg-red-500" />
            </div>

            <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col min-h-[500px] no-print">
                <h3 className="font-bold text-lg text-gray-900 mb-6">
                    Transaction History <span className="text-sm font-normal text-gray-500 ml-2">
                        ({filterPeriod === 'daily' ? dateFilter : monthFilter})
                    </span>
                </h3>

                {paginatedBills.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p>No transactions found for this period.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Bill No</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Phone</th>
                                        <th className="px-6 py-3">Mode</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                        <th className="px-6 py-3 text-right text-green-600">Paid</th>
                                        <th className="px-6 py-3 text-right text-red-600">Pending</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedBills.map((bill, i) => {
                                        const paid = bill.paidAmount || 0;
                                        const pending = bill.amount - paid;
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500">{bill.date}</td>
                                                <td className="px-6 py-4 font-medium text-purple-600">{bill.bill_no}</td>
                                                <td className="px-6 py-4 text-gray-900">{bill.customer}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{bill.phone || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{bill.paymentMode}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">₹{bill.amount}</td>
                                                <td className="px-6 py-4 text-right font-medium text-green-600">₹{paid}</td>
                                                <td className="px-6 py-4 text-right font-bold text-red-600">₹{pending}</td>
                                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openPaymentModal(bill)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                        title="Add Payment / Advance"
                                                    >
                                                        <CreditCard size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openPrintModal(bill)}
                                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                                        title="Print Invoice"
                                                    >
                                                        <Printer size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
