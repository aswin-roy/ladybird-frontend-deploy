import React, { useState, useEffect } from 'react';
import { ViewState, Customer, Product } from '../types/types';
import { InputField } from '../components/InputField';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { salesEntryService } from '../services/salesEntryService';
import { Search, Package, Plus, Minus, Trash2, ShoppingCart, UserCheck, Wallet, CreditCard as CardIcon, Smartphone, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Sales: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [cart, setCart] = useState<{ product: Product, quantity: number }[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [isManualPayment, setIsManualPayment] = useState(false);
    const categories = ['All', 'Fabric', 'Accessories', 'Tools', 'Consumables'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [productsData, customersData] = await Promise.all([
                productService.getAll(),
                customerService.getAll()
            ]);
            setProducts(productsData);
            setCustomers(customersData);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    const addToCart = (product: Product) => {
        if (product.stock <= 0) {
            alert('Item is out of stock!');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    alert(`Cannot add more. Only ${product.stock} units available.`);
                    return prev;
                }
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === id) {
                const newQty = item.quantity + delta;
                if (delta > 0 && newQty > item.product.stock) {
                    alert(`Cannot add more. Only ${item.product.stock} units available.`);
                    return item;
                }
                return { ...item, quantity: Math.max(0, newQty) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.product.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    useEffect(() => {
        if (!isManualPayment) {
            setPaidAmount(total);
        }
    }, [total, isManualPayment]);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        // Validate that all products have _id
        const productsWithoutId = cart.filter(item => !item.product._id);
        if (productsWithoutId.length > 0) {
            alert('Some products are missing IDs. Please refresh the page and try again.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Get or create walk-in customer if no customer selected
            let customerId: string;
            if (selectedCustomer) {
                customerId = selectedCustomer._id || '';
                if (!customerId) {
                    alert('Customer ID is missing. Please select the customer again.');
                    return;
                }
            } else {
                // Try to find or create a walk-in customer
                try {
                    // Use cached customers for search, fallback to API if needed
                    const walkInCustomers = customers.filter(c =>
                        c.name.toLowerCase().includes('walk-in')
                    );

                    if (walkInCustomers.length > 0) {
                        customerId = walkInCustomers[0]._id || '';
                    } else {
                        // Create walk-in customer
                        const newCustomer = await customerService.create({
                            name: 'Walk-in Customer',
                            phone: '0000000000',
                            address: 'Walk-in'
                        });
                        customerId = newCustomer._id || '';
                        // Reload customers to include the new one
                        const updatedCustomers = await customerService.getAll();
                        setCustomers(updatedCustomers);
                    }
                } catch (err) {
                    alert('Failed to create walk-in customer. Please select a customer.');
                    return;
                }
            }

            // Convert paymentMode to lowercase for backend
            const paymentMethod = paymentMode.toLowerCase() as 'cash' | 'card' | 'upi';

            // Transform items to backend format
            const items = cart.map(item => ({
                product: item.product._id!,
                quantity: item.quantity,
                rate: item.product.price,
            }));

            customerId,
                items,
                paymentMethod,
                paidAmount: paidAmount, // User defined payment amount
                    notes: `Sale via ${paymentMode}`
        });

        alert(`Sale Completed! Total: ₹${total.toFixed(2)} for ${selectedCustomer?.name || 'Walk-in Customer'} via ${paymentMode}`);
        setCart([]);
        setSelectedCustomer(null);
        setCustomerSearch('');
        setPaymentMode('Cash');
        setPaidAmount(0);
        setIsManualPayment(false);
    } catch (err) {
        const apiError = err as ApiError;
        const errorMessage = apiError.message || 'Failed to complete sale';
        setError(errorMessage);
        alert(errorMessage);
        console.error('Sales entry error:', err);
    } finally {
        setIsSubmitting(false);
    }
};

const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setIsCustomerDropdownOpen(false);
};

if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <Loader2 className="animate-spin text-purple-600" size={48} />
        </div>
    );
}

return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
        {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
                {error}
            </div>
        )}

        <div className="flex-1 bg-gray-50 rounded-2xl shadow-sm border border-gray-200 flex flex-col p-6 overflow-hidden">
            <div className="mb-6 flex-shrink-0">
                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <InputField
                        placeholder="Search products..."
                        className="pl-12 h-12 text-base"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map(c => (
                        <button
                            key={c}
                            onClick={() => setSelectedCategory(c)}
                            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === c ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-2">
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-lg cursor-pointer transition-all hover:border-purple-300 bg-gray-50 group flex flex-col relative"
                    >
                        {p.stock < 50 && (
                            <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                                Low Stock
                            </div>
                        )}
                        <div className="h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                            <Package size={32} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm truncate mb-1">{p.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{p.sku}</p>
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-purple-700 font-bold text-lg">₹{p.price}</span>
                            <button className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full flex flex-col items-center justify-center text-gray-400 h-full">
                        <Search size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No products found</p>
                        <p className="text-sm">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>

        <div className="w-full lg:w-[28rem] bg-gray-50 rounded-2xl border border-gray-200 flex flex-col h-full flex-shrink-0">
            <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    <UserCheck size={20} className="text-purple-600" /> Bill To
                </h3>
                <div className="relative">
                    <InputField
                        placeholder="Search customer or use Walk-in"
                        value={customerSearch}
                        onChange={e => {
                            setCustomerSearch(e.target.value);
                            setIsCustomerDropdownOpen(true);
                            if (!e.target.value) setSelectedCustomer(null);
                        }}
                        onFocus={() => setIsCustomerDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                        className="bg-gray-50"
                    />
                    {isCustomerDropdownOpen && customerSearch && (
                        <div className="absolute top-full left-0 w-full bg-gray-50 border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto">
                            {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                <div
                                    key={c.id}
                                    onMouseDown={() => handleSelectCustomer(c)}
                                    className="p-3 hover:bg-purple-50 cursor-pointer text-sm"
                                >
                                    <p className="font-medium">{c.name}</p>
                                    <p className="text-xs text-gray-500">{c.phone}</p>
                                </div>
                            )) : <div className="p-3 text-sm text-gray-500">No customer found.</div>}
                        </div>
                    )}
                    {selectedCustomer && (
                        <div className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                            Selected
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4">
                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">Your cart is empty</p>
                        <p className="text-sm text-center">Click on a product from the list to add it to the bill.</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.product.id} className="flex justify-between items-center p-3 border border-gray-200 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex-1 mr-2">
                                <p className="font-bold text-sm text-gray-800 truncate">{item.product.name}</p>
                                <p className="text-xs text-gray-500">₹{item.product.price} / unit</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                    <button
                                        onClick={() => updateQty(item.product.id, -1)}
                                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-l-lg"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.product.id, 1)}
                                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-r-lg"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <p className="font-bold text-sm w-16 text-right">₹{item.product.price * item.quantity}</p>
                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="text-gray-400 hover:text-red-500 p-1.5"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t-2 border-dashed border-gray-200 rounded-b-2xl">
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Tax (5%)</span>
                        <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-purple-600">₹{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Paid Amount</p>
                    <InputField
                        type="number"
                        value={paidAmount}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setPaidAmount(isNaN(val) ? 0 : val);
                            setIsManualPayment(true);
                        }}
                        placeholder="Enter paid amount"
                    />
                </div>
                <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Payment Mode</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[{ name: 'Cash', icon: Wallet }, { name: 'Card', icon: CardIcon }, { name: 'UPI', icon: Smartphone }].map((mode) => (
                            <button
                                key={mode.name}
                                onClick={() => setPaymentMode(mode.name as any)}
                                className={`py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${paymentMode === mode.name
                                    ? 'bg-purple-50 text-purple-700 border-purple-600'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                            >
                                <mode.icon size={16} /> {mode.name}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isSubmitting}
                    className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                >
                    {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                    Pay Now
                </button>
            </div>
        </div>
    </div>
);
};


//////
/*import React, { useState, useEffect } from 'react';
import { ViewState, Customer, Product } from '../types/types';
import { InputField } from '../components/InputField';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { salesEntryService } from '../services/salesEntryService';
import { Search, Package, Plus, Minus, Trash2, ShoppingCart, UserCheck, Wallet, CreditCard as CardIcon, Smartphone, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Sales: React.FC<{ onNavigate: (view: ViewState) => void }> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
    const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI'>('Cash');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const categories = ['All', 'Fabric', 'Accessories', 'Tools', 'Consumables'];

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const [productsData, customersData] = await Promise.all([
                productService.getAll(),
                customerService.getAll()
            ]);
            setProducts(productsData);
            setCustomers(customersData);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load data');
            console.error('Error loading data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        (selectedCategory === 'All' || p.category === selectedCategory) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone.includes(customerSearch)
    );

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQty = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === id) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };
    
    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.product.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Cart is empty!');
            return;
        }

        // Validate that all products have _id
        const productsWithoutId = cart.filter(item => !item.product._id);
        if (productsWithoutId.length > 0) {
            alert('Some products are missing IDs. Please refresh the page and try again.');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            
            // Get or create walk-in customer if no customer selected
            let customerId: string;
            if (selectedCustomer) {
                customerId = selectedCustomer._id || '';
                if (!customerId) {
                    alert('Customer ID is missing. Please select the customer again.');
                    return;
                }
            } else {
                // Try to find or create a walk-in customer
                try {
                    // Use cached customers for search, fallback to API if needed
                    const walkInCustomers = customers.filter(c => 
                        c.name.toLowerCase().includes('walk-in')
                    );
                    
                    if (walkInCustomers.length > 0) {
                        customerId = walkInCustomers[0]._id || '';
                    } else {
                        // Create walk-in customer
                        const newCustomer = await customerService.create({
                            name: 'Walk-in Customer',
                            phone: '0000000000',
                            address: 'Walk-in'
                        });
                        customerId = newCustomer._id || '';
                        // Reload customers to include the new one
                        const updatedCustomers = await customerService.getAll();
                        setCustomers(updatedCustomers);
                    }
                } catch (err) {
                    alert('Failed to create walk-in customer. Please select a customer.');
                    return;
                }
            }

            // Convert paymentMode to lowercase for backend
            const paymentMethod = paymentMode.toLowerCase() as 'cash' | 'card' | 'upi';
            
            // Transform items to backend format
            const items = cart.map(item => ({
                product: item.product._id!,
                quantity: item.quantity,
                rate: item.product.price,
            }));

            await salesEntryService.create({
                customerId,
                items,
                paymentMethod,
                paidAmount: total, // Full payment
                notes: `Sale via ${paymentMode}`
            });

            alert(`Sale Completed! Total: ₹${total.toFixed(2)} for ${selectedCustomer?.name || 'Walk-in Customer'} via ${paymentMode}`);
            setCart([]);
            setSelectedCustomer(null);
            setCustomerSearch('');
            setPaymentMode('Cash');
        } catch (err) {
            const apiError = err as ApiError;
            const errorMessage = apiError.message || 'Failed to complete sale';
            setError(errorMessage);
            alert(errorMessage);
            console.error('Sales entry error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setCustomerSearch(customer.name);
        setIsCustomerDropdownOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="animate-spin text-purple-600" size={48} />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6">
            {error && (
                <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
                    {error}
                </div>
            )}

            <div className="flex-1 bg-gray-50 rounded-2xl shadow-sm border border-gray-200 flex flex-col p-6 overflow-hidden">
                <div className="mb-6 flex-shrink-0">
                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                        <InputField 
                            placeholder="Search products..." 
                            className="pl-12 h-12 text-base" 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {categories.map(c => (
                            <button 
                                key={c} 
                                onClick={() => setSelectedCategory(c)} 
                                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                                    selectedCategory === c ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto flex-1 pb-2">
                    {filteredProducts.length > 0 ? filteredProducts.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => addToCart(p)} 
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-lg cursor-pointer transition-all hover:border-purple-300 bg-gray-50 group flex flex-col relative"
                        >
                            {p.stock < 50 && (
                                <div className="absolute top-2 right-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                                    Low Stock
                                </div>
                            )}
                            <div className="h-24 bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                                <Package size={32} />
                            </div>
                            <h4 className="font-bold text-gray-800 text-sm truncate mb-1">{p.name}</h4>
                            <p className="text-xs text-gray-500 mb-2">{p.sku}</p>
                            <div className="flex justify-between items-center mt-auto">
                                <span className="text-purple-700 font-bold text-lg">₹{p.price}</span>
                                <button className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <Plus size={16}/>
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-400 h-full">
                            <Search size={48} className="mb-4 opacity-20"/>
                            <p className="font-medium">No products found</p>
                            <p className="text-sm">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full lg:w-[28rem] bg-gray-50 rounded-2xl border border-gray-200 flex flex-col h-full flex-shrink-0">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <UserCheck size={20} className="text-purple-600"/> Bill To
                    </h3>
                    <div className="relative">
                        <InputField 
                            placeholder="Search customer or use Walk-in" 
                            value={customerSearch}
                            onChange={e => {
                                setCustomerSearch(e.target.value);
                                setIsCustomerDropdownOpen(true);
                                if (!e.target.value) setSelectedCustomer(null);
                            }}
                            onFocus={() => setIsCustomerDropdownOpen(true)}
                            onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                            className="bg-gray-50"
                        />
                        {isCustomerDropdownOpen && customerSearch && (
                            <div className="absolute top-full left-0 w-full bg-gray-50 border border-gray-200 rounded-lg shadow-lg z-20 mt-1 max-h-48 overflow-y-auto">
                                {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                    <div 
                                        key={c.id} 
                                        onMouseDown={() => handleSelectCustomer(c)} 
                                        className="p-3 hover:bg-purple-50 cursor-pointer text-sm"
                                    >
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-xs text-gray-500">{c.phone}</p>
                                    </div>
                                )) : <div className="p-3 text-sm text-gray-500">No customer found.</div>}
                            </div>
                        )}
                        {selectedCustomer && (
                            <div className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                Selected
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4">
                            <ShoppingCart size={48} className="mb-4 opacity-20"/>
                            <p className="font-medium">Your cart is empty</p>
                            <p className="text-sm text-center">Click on a product from the list to add it to the bill.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product.id} className="flex justify-between items-center p-3 border border-gray-200 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex-1 mr-2">
                                    <p className="font-bold text-sm text-gray-800 truncate">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">₹{item.product.price} / unit</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                                        <button 
                                            onClick={() => updateQty(item.product.id, -1)} 
                                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-l-lg"
                                        >
                                            <Minus size={14}/>
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQty(item.product.id, 1)} 
                                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-r-lg"
                                        >
                                            <Plus size={14}/>
                                        </button>
                                    </div>
                                    <p className="font-bold text-sm w-16 text-right">₹{item.product.price * item.quantity}</p>
                                    <button 
                                        onClick={() => removeFromCart(item.product.id)} 
                                        className="text-gray-400 hover:text-red-500 p-1.5"
                                    >
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t-2 border-dashed border-gray-200 rounded-b-2xl">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Tax (5%)</span>
                            <span className="font-medium">₹{tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span className="text-purple-600">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Payment Mode</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[{ name: 'Cash', icon: Wallet }, { name: 'Card', icon: CardIcon }, { name: 'UPI', icon: Smartphone }].map((mode) => (
                                <button 
                                    key={mode.name} 
                                    onClick={() => setPaymentMode(mode.name as any)} 
                                    className={`py-2 rounded-lg text-sm font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                        paymentMode === mode.name 
                                            ? 'bg-purple-50 text-purple-700 border-purple-600' 
                                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    <mode.icon size={16}/> {mode.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={handleCheckout} 
                        disabled={cart.length === 0 || isSubmitting} 
                        className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={20} />}
                        Pay Now
                    </button>
                </div>
            </div>
        </div>
    );
};*/
