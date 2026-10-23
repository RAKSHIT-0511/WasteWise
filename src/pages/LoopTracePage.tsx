import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Tag,
  CheckCircle2,
  Clock,
  Wrench,
  Heart,
  ShoppingBag,
  Recycle,
  FileText,
  User
} from 'lucide-react';
import type { LoopTraceRecord, LoopTraceAction, LoopTraceStatus } from '@/types';
import {
  LOOPTRACE_CATEGORIES,
  LOOPTRACE_ACTIONS,
  getLoopTraceRecords,
  createLoopTraceRecord,
  updateLoopTraceRecord,
  deleteLoopTraceRecord,
  calculateSummary,
} from '@/services/looptraceService';

interface NavState {
  fromNextWorth?: boolean;
  itemName?: string;
  category?: string;
  suggestedAction?: LoopTraceAction;
  notes?: string;
}

export const LoopTracePage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navState = (location.state as NavState) || {};

  const currentUserId = user?.id || 'guest';

  // Records state
  const [records, setRecords] = useState<LoopTraceRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(Boolean(navState.fromNextWorth || navState.itemName));
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  const [itemName, setItemName] = useState<string>(navState.itemName || '');
  const [category, setCategory] = useState<string>(navState.category || LOOPTRACE_CATEGORIES[0]);
  const [action, setAction] = useState<LoopTraceAction>(navState.suggestedAction || 'reused');
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [recordStatus, setRecordStatus] = useState<LoopTraceStatus>('completed');
  const [notes, setNotes] = useState<string>(navState.notes || '');

  // Filter state
  const [filterType, setFilterType] = useState<'all' | 'second_life' | 'recycled'>('all');

  // Load records
  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getLoopTraceRecords(currentUserId);
      setRecords(data);
    } catch {
      setStatusMessage({ type: 'error', text: 'Unable to load activity records.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentUserId]);

  // Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter an item name.' });
      return;
    }

    try {
      if (editingRecordId) {
        // Update existing
        await updateLoopTraceRecord(
          editingRecordId,
          {
            itemName: itemName.trim(),
            category,
            action,
            date: recordDate,
            status: recordStatus,
            notes: notes.trim(),
          },
          currentUserId
        );
        setStatusMessage({ type: 'success', text: `Updated "${itemName}" successfully.` });
      } else {
        // Create new
        await createLoopTraceRecord({
          userId: currentUserId,
          itemName: itemName.trim(),
          category,
          action,
          date: recordDate,
          status: recordStatus,
          notes: notes.trim(),
          source: navState.fromNextWorth ? 'nextworth' : 'manual',
        });
        setStatusMessage({ type: 'success', text: `Recorded "${itemName}" in LoopTrace.` });
      }

      // Reset form
      handleResetForm();
      await loadRecords();
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save record.',
      });
    }
  };

  const handleEdit = (record: LoopTraceRecord) => {
    setEditingRecordId(record.id);
    setItemName(record.itemName);
    setCategory(record.category);
    setAction(record.action);
    setRecordDate(record.date);
    setRecordStatus(record.status);
    setNotes(record.notes || '');
    setIsFormOpen(true);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  const handleDelete = async (record: LoopTraceRecord) => {
    if (!window.confirm(`Are you sure you want to remove "${record.itemName}" from your activity log?`)) {
      return;
    }

    try {
      await deleteLoopTraceRecord(record.id, currentUserId);
      setStatusMessage({ type: 'success', text: `Removed "${record.itemName}".` });
      await loadRecords();
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to delete record.' });
    }
  };

  const handleResetForm = () => {
    setEditingRecordId(null);
    setItemName('');
    setCategory(LOOPTRACE_CATEGORIES[0]);
    setAction('reused');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setRecordStatus('completed');
    setNotes('');
    setIsFormOpen(false);
  };

  // Metrics summary strictly derived from records
  const summary = calculateSummary(records);

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    if (filterType === 'second_life') {
      return ['reused', 'repaired', 'donated', 'resold'].includes(rec.action);
    }
    if (filterType === 'recycled') {
      return rec.action === 'recycled';
    }
    return true;
  });

  const getActionIcon = (act: LoopTraceAction) => {
    switch (act) {
      case 'reused':
        return <RotateCcw className="w-4 h-4 text-emerald-700" />;
      case 'repaired':
        return <Wrench className="w-4 h-4 text-blue-700" />;
      case 'donated':
        return <Heart className="w-4 h-4 text-purple-700" />;
      case 'resold':
        return <ShoppingBag className="w-4 h-4 text-amber-700" />;
      case 'recycled':
        return <Recycle className="w-4 h-4 text-teal-700" />;
    }
  };

  const getActionBadgeColor = (act: LoopTraceAction) => {
    switch (act) {
      case 'reused':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'repaired':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'donated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resold':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'recycled':
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  return (
    <div className="flex flex-col w-full relative">
      <div className="max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop pt-space-md pb-space-2xl flex flex-col gap-space-md">
        
        {/* ========================================================================= */}
        {/* 1. HEADER SECTION                                                         */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-secondary-fixed/50 flex items-center justify-center text-primary font-bold">
                <RotateCcw className="w-4 h-4 text-primary" />
              </span>
              <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
                LoopTrace
              </span>
            </div>

            {/* User Session Scope Badge */}
            {user ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-medium border border-primary/20">
                <User className="w-3.5 h-3.5 text-secondary" />
                <span>Linked to <strong>{user.displayName}</strong></span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[12px]">
                <span>Stored locally on this device · </span>
                <Link to="/profile" className="text-secondary font-bold hover:underline">
                  Sign in to sync
                </Link>
              </span>
            )}
          </div>

          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary font-bold tracking-tight">
            Track Your Environmental Impact
          </h1>

          <p className="text-[14px] text-on-surface-variant leading-relaxed">
            Record items you reuse, repair, donate, resell, or recycle to see your personal circular progress.
          </p>

          {/* Prefilled from NextWorth Banner */}
          {navState.fromNextWorth && isFormOpen && (
            <div className="mt-2 p-3 rounded-2xl bg-secondary-fixed/30 border border-secondary/30 flex items-center justify-between gap-2 text-[13px]">
              <div className="flex items-center gap-2 truncate">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="truncate">
                  Prefilled from NextWorth: <strong>{itemName}</strong>. Confirm your action and save below.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleResetForm()}
                className="text-on-surface-variant hover:text-on-surface font-bold px-2 py-0.5 rounded text-xs"
              >
                Clear
              </button>
            </div>
          )}

          {/* Notification banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-[13px] font-medium flex items-center justify-between gap-2 transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-secondary-fixed/40 text-primary border border-secondary/40'
                  : 'bg-error-container/30 text-error border border-error/30'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                type="button"
                onClick={() => setStatusMessage(null)}
                className="font-bold text-xs px-2 py-0.5 hover:opacity-80"
              >
                ✕
              </button>
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 2. SIMPLE SUMMARY METRICS (GENUINE CALCULATION FROM USER RECORDS)          */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
          
          <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container-high/60 shadow-xs flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Activities
            </span>
            <span className="text-3xl font-extrabold text-primary font-headline-lg tracking-tight">
              {summary.totalActivities}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Recorded lifecycle actions
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container-high/60 shadow-xs flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-secondary uppercase tracking-wider">
              Second Life Given
            </span>
            <span className="text-3xl font-extrabold text-primary font-headline-lg tracking-tight">
              {summary.itemsSecondLife}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Reused, repaired, donated, or resold
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container-high/60 shadow-xs flex flex-col gap-1">
            <span className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Items Recycled
            </span>
            <span className="text-3xl font-extrabold text-primary font-headline-lg tracking-tight">
              {summary.itemsRecycled}
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Diverted via municipal recycling
            </span>
          </div>

        </section>

        {/* Action Breakdown Chips */}
        {summary.totalActivities > 0 && (
          <div className="flex flex-wrap gap-1.5 items-center px-1">
            <span className="text-[11px] font-bold text-on-surface-variant mr-1">Activity Breakdown:</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
              Reused: {summary.byAction.reused}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold">
              Repaired: {summary.byAction.repaired}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold">
              Donated: {summary.byAction.donated}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold">
              Resold: {summary.byAction.resold}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold">
              Recycled: {summary.byAction.recycled}
            </span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. RECORD AN ACTION FORM (INLINE OR COLLAPSIBLE)                          */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-sm">
          
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {editingRecordId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </span>
              <h2 className="font-headline-sm text-[16px] text-primary font-bold">
                {editingRecordId ? 'Edit Activity Record' : 'Record an Activity'}
              </h2>
            </div>

            {!isFormOpen && !editingRecordId && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="py-1.5 px-3 rounded-full bg-primary-container text-secondary-fixed text-[12px] font-bold hover:bg-primary transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            )}

            {(isFormOpen || editingRecordId) && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[12px] text-on-surface-variant hover:text-on-surface font-medium"
              >
                Cancel
              </button>
            )}
          </div>

          {(isFormOpen || editingRecordId) && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-space-sm pt-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                
                {/* 1. Item Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="loop-item-name" className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-secondary" />
                    <span>Item Name *</span>
                  </label>
                  <input
                    type="text"
                    id="loop-item-name"
                    required
                    placeholder="e.g. Cotton T-shirt, Mason Jar, Laptop"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>

                {/* 2. Category */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="loop-category" className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-secondary" />
                    <span>Category</span>
                  </label>
                  <select
                    id="loop-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  >
                    {LOOPTRACE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* 3. Action Selection */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-bold text-primary">
                  Action Taken *
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {LOOPTRACE_ACTIONS.map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setAction(act.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        action === act.id
                          ? 'border-secondary bg-secondary-fixed/30 ring-1 ring-secondary'
                          : 'border-surface-container-high bg-surface-container-low hover:border-surface-container-highest'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {getActionIcon(act.id)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          {act.badge}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-primary">
                        {act.label}
                      </span>
                      <span className="text-[11px] text-on-surface-variant line-clamp-1">
                        {act.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                
                {/* 4. Date */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="loop-date" className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-secondary" />
                    <span>Date of Action</span>
                  </label>
                  <input
                    type="date"
                    id="loop-date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  />
                </div>

                {/* 5. Status */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="loop-status" className="text-[13px] font-bold text-primary flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>Status</span>
                  </label>
                  <select
                    id="loop-status"
                    value={recordStatus}
                    onChange={(e) => setRecordStatus(e.target.value as LoopTraceStatus)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] focus:outline-none focus:ring-2 focus:ring-secondary font-medium"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress / Planned</option>
                  </select>
                </div>

              </div>

              {/* 6. Optional Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="loop-notes" className="text-[13px] font-bold text-primary">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  id="loop-notes"
                  placeholder="e.g. Turned into cleaning cloths, repaired zipper, donated to shelter"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-[13px] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="py-2.5 px-space-lg rounded-full bg-primary-container hover:bg-primary active:scale-[0.98] text-secondary-fixed text-[13px] font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
                  <span>{editingRecordId ? 'Save Changes' : 'Save to LoopTrace'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="py-2.5 px-4 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface text-[13px] font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

            </form>
          )}

        </section>

        {/* ========================================================================= */}
        {/* 4. ACTIVITY TIMELINE / HISTORY LIST                                       */}
        {/* ========================================================================= */}
        <section className="bg-surface-container-lowest rounded-3xl p-space-md md:p-space-lg shadow-xs border border-surface-container-high/60 flex flex-col gap-space-sm">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-3">
            <div>
              <h2 className="font-headline-sm text-[16px] text-primary font-bold">
                Activity History
              </h2>
              <span className="text-[12px] text-on-surface-variant">
                {records.length} item{records.length === 1 ? '' : 's'} recorded
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full border border-surface-container-high/60">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  filterType === 'all'
                    ? 'bg-primary-container text-secondary-fixed font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('second_life')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  filterType === 'second_life'
                    ? 'bg-primary-container text-secondary-fixed font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Second Life ({summary.itemsSecondLife})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('recycled')}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                  filterType === 'recycled'
                    ? 'bg-primary-container text-secondary-fixed font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Recycled ({summary.itemsRecycled})
              </button>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant gap-2">
              <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px]">Loading activity history...</span>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredRecords.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                <RotateCcw className="w-7 h-7 text-secondary" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h3 className="font-headline-sm text-[16px] text-primary font-bold">
                  {records.length === 0 ? 'No activity recorded yet' : 'No records match this filter'}
                </h3>
                <p className="text-[13px] text-on-surface-variant leading-relaxed">
                  {records.length === 0
                    ? 'When you repair an item, donate clothing, repurpose a container, or recycle packaging, record it here to track your circular journey.'
                    : 'Try selecting a different filter above to view your recorded activities.'}
                </p>
              </div>
              {records.length === 0 && !isFormOpen && (
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="py-2 px-4 rounded-full bg-primary-container text-secondary-fixed text-[13px] font-bold hover:bg-primary transition-colors flex items-center gap-1.5 mt-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Record Your First Item</span>
                </button>
              )}
            </div>
          )}

          {/* Record Items List */}
          {!isLoading && filteredRecords.length > 0 && (
            <div className="flex flex-col divide-y divide-surface-container">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="py-3 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/40 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center flex-shrink-0 mt-0.5 border border-surface-container-high/60">
                      {getActionIcon(record.action)}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-[14px] text-primary">
                          {record.itemName}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeColor(
                            record.action
                          )}`}
                        >
                          {record.action}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-medium">
                          {record.category}
                        </span>
                      </div>

                      {record.notes && (
                        <p className="text-[12px] text-on-surface-variant leading-snug">
                          {record.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant/80 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{record.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          {record.status === 'completed' ? (
                            <CheckCircle2 className="w-3 h-3 text-secondary" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          <span className="capitalize">{record.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 self-end sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(record)}
                      aria-label={`Edit ${record.itemName}`}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record)}
                      aria-label={`Delete ${record.itemName}`}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </section>

      </div>
    </div>
  );
};
