/*import React, { useState, useEffect } from 'react';
import { Worker } from '../types/types';
import { InputField } from '../components/InputField';
import { workerService } from '../services/workerService';
import { Search, Plus, Edit2, Trash2, Loader2, Filter, Calendar } from 'lucide-react';
import { ApiError } from '../services/api';

export const WorkerReport: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentWorker, setCurrentWorker] = useState<Partial<Worker>>({ name: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState('month'); // 'month', 'year', 'day', 'custom'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadWorkers();
  }, [filterType, selectedDate, selectedMonth, selectedYear, startDate, endDate]);

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = { type: filterType };

      if (filterType === 'day') {
        params.date = selectedDate;
      } else if (filterType === 'month') {
        params.month = parseInt(selectedMonth);
        params.year = parseInt(selectedYear);
      } else if (filterType === 'year') {
        params.year = parseInt(selectedYear);
      } else if (filterType === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const data = await workerService.getAll(params);
      setWorkers(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load workers');
      console.error('Error loading workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentWorker({ name: '', role: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (worker: Worker) => {
    setModalMode('edit');
    setCurrentWorker(worker);
    setIsModalOpen(true);
  };

  const handleSaveWorker = async () => {
    if (!currentWorker.name || !currentWorker.role) {
      alert('Name and Role are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (modalMode === 'add') {
        await workerService.create({
          name: currentWorker.name!,
          role: currentWorker.role!,
        });
      } else if (currentWorker.id) {
        await workerService.update({
          id: currentWorker.id,
          name: currentWorker.name,
          role: currentWorker.role,
        });
      }

      setIsModalOpen(false);
      setCurrentWorker({ name: '', role: '' });
      await loadWorkers();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save worker');
      alert(apiError.message || 'Failed to save worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      setError(null);
      await workerService.delete(id);
      await loadWorkers();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete worker');
      alert(apiError.message || 'Failed to delete worker');
    }
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Null-safe calculations with ?? 0 fallback
  const totalCutting = workers.reduce((sum, w) => sum + (w.cutting_earnings ?? 0), 0);
  const totalStitching = workers.reduce((sum, w) => sum + (w.stitching_earnings ?? 0), 0);
  const totalCommission = workers.reduce((sum, w) => sum + (w.total_commission ?? 0), 0);

  // Generate year options (current year back 5 years)
  const currentY = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentY - i);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-4">{modalMode === 'add' ? 'Add New Worker' : 'Edit Worker'}</h3>
            <div className="space-y-4">
              <InputField
                placeholder="Worker Name"
                value={currentWorker.name || ''}
                onChange={e => setCurrentWorker({ ...currentWorker, name: e.target.value })}
              />
              <InputField
                placeholder="Role (e.g., Master Cutter)"
                value={currentWorker.role || ''}
                onChange={e => setCurrentWorker({ ...currentWorker, role: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWorker}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Worker Reports</h2>
          <p className="text-gray-500 mt-1">Track employee performance and commissions</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-orange-50 px-5 py-3 rounded-xl border border-orange-100 text-center">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">TOTAL CUTTING</p>
            <p className="text-xl font-bold text-orange-600">₹{(totalCutting ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 px-5 py-3 rounded-xl border border-blue-100 text-center">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">TOTAL STITCHING</p>
            <p className="text-xl font-bold text-blue-600">₹{(totalStitching ?? 0).toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 px-5 py-3 rounded-xl border border-purple-100 text-center">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">TOTAL COMMISSION</p>
            <p className="text-xl font-bold text-purple-600">₹{(totalCommission ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter By:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="day">Day</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        {filterType === 'month' && (
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {filterType === 'year' && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {filterType === 'day' && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
        )}

        {filterType === 'custom' && (
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Start Date"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="End Date"
            />
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <InputField
              placeholder="Search workers..."
              className="pl-10 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={openAddModal}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 font-medium text-sm shadow-md"
            >
              <Plus size={18} /> Add New Worker
            </button>
          </div>
        </div>

        <div className="overflow-auto flex-1">
          {filteredWorkers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <p className="text-lg font-medium">No workers found</p>
              <p className="text-sm mt-2">{searchTerm ? 'Try adjusting your search' : 'Add your first worker to get started'}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Worker Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4 text-center">Active Jobs</th>
                  <th className="px-6 py-4 text-right text-orange-600">Cutting Amt</th>
                  <th className="px-6 py-4 text-right text-blue-600">Stitching Amt</th>
                  <th className="px-6 py-4 text-right text-green-600">Total Commission</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredWorkers.map(worker => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mr-3">
                          {worker.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{worker.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{worker.role}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold">{worker.active_orders ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-orange-600">₹{(worker.cutting_earnings ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-blue-600">₹{(worker.stitching_earnings ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">₹{(worker.total_commission ?? 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(worker)}
                        className="text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteWorker(worker.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
*/

import React, { useState, useEffect } from 'react';
import { Worker } from '../types/types';
import { InputField } from '../components/InputField';
import { workerService } from '../services/workerService';
import { Search, Plus, Edit2, Trash2, Loader2, Filter } from 'lucide-react';
import { ApiError } from '../services/api';

export const WorkerReport: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentWorker, setCurrentWorker] = useState<Partial<Worker>>({ name: '', role: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState('month'); // 'month', 'year', 'day', 'custom'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadWorkers();
  }, [filterType, selectedDate, selectedMonth, selectedYear, startDate, endDate]);

  const loadWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: any = { type: filterType };
      if (filterType === 'day') params.date = selectedDate;
      else if (filterType === 'month') { params.month = parseInt(selectedMonth); params.year = parseInt(selectedYear); }
      else if (filterType === 'year') params.year = parseInt(selectedYear);
      else if (filterType === 'custom' && startDate && endDate) { params.startDate = startDate; params.endDate = endDate; }

      const data = await workerService.getAll(params);
      console.log('Backend response:', data);

      // SAFELY MAP DATA
      const mappedWorkers = (data ?? []).map((w: any, index: number) => ({
        id: w.worker?.id ?? w.worker?._id ?? w._id ?? index.toString(),
        name: w.worker?.name ?? w.name ?? 'Unknown',
        role: w.worker?.role ?? w.role ?? '-',
        cutting_earnings: w.totalsByTask?.cutting ?? 0,
        stitching_earnings: w.totalsByTask?.stitching ?? 0,
        total_commission: w.totalCommission ?? 0,
        active_orders: w.active_orders ?? 0
      }));

      setWorkers(mappedWorkers);

    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load workers');
      console.error('Error loading workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setCurrentWorker({ name: '', role: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (worker: Worker) => {
    setModalMode('edit');
    setCurrentWorker(worker);
    setIsModalOpen(true);
  };

  const handleSaveWorker = async () => {
    if (!currentWorker.name || !currentWorker.role) {
      alert('Name and Role are required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (modalMode === 'add') {
        await workerService.create({
          name: currentWorker.name!,
          role: currentWorker.role!,
        });
      } else if (currentWorker.id) {
        await workerService.update({
          id: currentWorker.id,
          name: currentWorker.name,
          role: currentWorker.role,
        });
      }

      setIsModalOpen(false);
      setCurrentWorker({ name: '', role: '' });
      await loadWorkers();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to save worker');
      alert(apiError.message || 'Failed to save worker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorker = async (id: string) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      setError(null);
      await workerService.delete(id);
      await loadWorkers();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to delete worker');
      alert(apiError.message || 'Failed to delete worker');
    }
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCutting = workers.reduce((sum, w) => sum + (w.cutting_earnings ?? 0), 0);
  const totalStitching = workers.reduce((sum, w) => sum + (w.stitching_earnings ?? 0), 0);
  const totalCommission = workers.reduce((sum, w) => sum + (w.total_commission ?? 0), 0);

  const currentY = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentY - i);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      )}

      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-lg mb-4">{modalMode === 'add' ? 'Add New Worker' : 'Edit Worker'}</h3>
            <div className="space-y-4">
              <InputField
                placeholder="Worker Name"
                value={currentWorker.name || ''}
                onChange={e => setCurrentWorker({ ...currentWorker, name: e.target.value })}
              />
              <InputField
                placeholder="Role (e.g., Master Cutter)"
                value={currentWorker.role || ''}
                onChange={e => setCurrentWorker({ ...currentWorker, role: e.target.value })}
              />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg" disabled={isSubmitting}>Cancel</button>
                <button onClick={handleSaveWorker} className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Worker Reports</h2>
          <p className="text-gray-500 mt-1">Track employee performance and commissions</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-orange-50 px-5 py-3 rounded-xl border border-orange-100 text-center">
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">TOTAL CUTTING</p>
            <p className="text-xl font-bold text-orange-600">₹{totalCutting.toLocaleString()}</p>
          </div>
          <div className="bg-blue-50 px-5 py-3 rounded-xl border border-blue-100 text-center">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">TOTAL STITCHING</p>
            <p className="text-xl font-bold text-blue-600">₹{totalStitching.toLocaleString()}</p>
          </div>
          <div className="bg-purple-50 px-5 py-3 rounded-xl border border-purple-100 text-center">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">TOTAL COMMISSION</p>
            <p className="text-xl font-bold text-purple-600">₹{totalCommission.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Rest of your table and filters */}
      {/* ... same as your original table code, using filteredWorkers ... */}
    </div>
  );
};

