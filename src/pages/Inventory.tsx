import React, { useState, useEffect } from 'react';

import { Product } from '../types/types';
import { InputField, SelectField, Pagination } from '../components';
import { productService } from '../services/productService';
import { Search, Plus, X, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>({ id: 0, name: '', sku: '', category: '', price: 0, stock: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!currentProduct.name || !currentProduct.sku) {
      alert('Name and SKU are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (currentProduct.id === 0) {
        await productService.create({
          name: currentProduct.name,
          sku: currentProduct.sku,
          category: currentProduct.category,
          price: currentProduct.price,
          stock: currentProduct.stock,
        });
      } else {
        if (!currentProduct._id) {
          alert('System Error: Missing product ID. Please refresh.');
          return;
        }
        await productService.update({
          id: currentProduct._id, // Use MongoDB _id
          name: currentProduct.name,
          sku: currentProduct.sku,
          category: currentProduct.category,
          price: currentProduct.price,
          stock: currentProduct.stock,
        });
      }

      setIsModalOpen(false);
      setCurrentProduct({ id: 0, name: '', sku: '', category: '', price: 0, stock: 0 });
      await loadProducts();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save product');
      alert(apiError.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      setError(null);
      await productService.delete(id);
      await loadProducts();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete product');
      alert(apiError.message || 'Failed to delete product');
    }
  };

  const openAddModal = () => {
    setCurrentProduct({ id: 0, name: '', sku: '', category: '', price: 0, stock: 0 });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex flex-col relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
          {error}
        </div>
      )}

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-96 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{currentProduct.id === 0 ? 'Add Product' : 'Edit Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                <InputField
                  placeholder="Name"
                  value={currentProduct.name}
                  onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU Code</label>
                <InputField
                  placeholder="SKU"
                  value={currentProduct.sku}
                  onChange={e => setCurrentProduct({ ...currentProduct, sku: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <SelectField
                  value={currentProduct.category}
                  onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Tools">Tools</option>
                  <option value="Consumables">Consumables</option>
                </SelectField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                  <InputField
                    type="number"
                    placeholder="0.00"
                    value={currentProduct.price}
                    onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                  <InputField
                    type="number"
                    placeholder="0"
                    value={currentProduct.stock}
                    onChange={e => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
        <div>
          <h3 className="font-bold text-xl text-gray-900">Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Manage stock and products</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <InputField
              placeholder="Search products..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={openAddModal}
            className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md font-medium text-sm"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      <Package size={16} />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-mono">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded text-xs font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stock < 50 ? 'text-red-500' : 'text-green-600'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => { setCurrentProduct(product); setIsModalOpen(true); }}
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (product._id) {
                            handleDeleteProduct(product._id);
                          } else {
                            alert('Cannot delete: Missing product ID');
                          }
                        }}
                        className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete"
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

///////
/*import React, { useState, useEffect } from 'react';
import { Product } from '../types/types';
import { InputField, SelectField, Pagination } from '../components';
import { productService } from '../services/productService';
import { Search, Plus, X, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { ApiError } from '../services/api';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product>({ id: 0, name: '', sku: '', category: '', price: 0, stock: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productService.getAll();
      setProducts(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!currentProduct.name || !currentProduct.sku) {
      alert('Name and SKU are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      if (currentProduct.id === 0) {
        await productService.create({
          name: currentProduct.name,
          sku: currentProduct.sku,
          category: currentProduct.category,
          price: currentProduct.price,
          stock: currentProduct.stock,
        });
      } else {
        await productService.update({
          id: currentProduct.id,
          name: currentProduct.name,
          sku: currentProduct.sku,
          category: currentProduct.category,
          price: currentProduct.price,
          stock: currentProduct.stock,
        });
      }
      
      setIsModalOpen(false);
      setCurrentProduct({ id: 0, name: '', sku: '', category: '', price: 0, stock: 0 });
      await loadProducts();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save product');
      alert(apiError.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      setError(null);
      await productService.delete(id);
      await loadProducts();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete product');
      alert(apiError.message || 'Failed to delete product');
    }
  };

  const openAddModal = () => {
    setCurrentProduct({ id: 0, name: '', sku: '', category: '', price: 0, stock: 0 });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 h-[calc(100vh-8rem)] flex flex-col relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg z-50">
          {error}
        </div>
      )}

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-96 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{currentProduct.id === 0 ? 'Add Product' : 'Edit Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600" disabled={isSubmitting}>
                <X size={20}/>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name</label>
                <InputField 
                  placeholder="Name" 
                  value={currentProduct.name} 
                  onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU Code</label>
                <InputField 
                  placeholder="SKU" 
                  value={currentProduct.sku} 
                  onChange={e => setCurrentProduct({...currentProduct, sku: e.target.value})}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <SelectField 
                  value={currentProduct.category} 
                  onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})}
                  disabled={isSubmitting}
                >
                  <option value="">Select Category</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Tools">Tools</option>
                  <option value="Consumables">Consumables</option>
                </SelectField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price</label>
                  <InputField 
                    type="number" 
                    placeholder="0.00" 
                    value={currentProduct.price} 
                    onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock</label>
                  <InputField 
                    type="number" 
                    placeholder="0" 
                    value={currentProduct.stock} 
                    onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProduct} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
        <div>
          <h3 className="font-bold text-xl text-gray-900">Inventory</h3>
          <p className="text-sm text-gray-500 mt-1">Manage stock and products</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <InputField 
              placeholder="Search products..." 
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 shadow-md font-medium text-sm"
          >
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="overflow-auto flex-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first product to get started'}</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                      <Package size={16}/>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-800">{product.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm font-mono">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 rounded text-xs font-medium">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">₹{product.price}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${product.stock < 50 ? 'text-red-500' : 'text-green-600'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => { setCurrentProduct(product); setIsModalOpen(true); }} 
                        className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        className="text-red-400 hover:text-red-600 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete"
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
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};*/
