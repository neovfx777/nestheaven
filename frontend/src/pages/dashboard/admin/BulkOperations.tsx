import React, { useState } from 'react';
import { Check, X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { statusApi } from '../../../api/status';
import { toast } from 'react-hot-toast';

interface BulkOperationsProps {
  apartmentIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  apartmentIds,
  onClose,
  onSuccess,
}) => {
  const [operation, setOperation] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const operationOptions = [
    { value: 'HIDDEN', label: 'Hide Apartments', description: 'Hide selected apartments from public view' },
    { value: 'ACTIVE', label: 'Unhide Apartments', description: 'Make selected apartments visible' },
  ];

  const handleBulkOperation = async () => {
    if (!operation) {
      toast.error('Please select an operation');
      return;
    }

    setIsSubmitting(true);
    try {
      await statusApi.bulkChangeStatus(apartmentIds, operation, reason || undefined);
      toast.success(`Successfully updated ${apartmentIds.length} apartment(s)`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to perform bulk operation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOperationIcon = (op: string) => {
    switch (op) {
      case 'HIDDEN':
        return <EyeOff className="h-5 w-5 text-gray-600" />;
      case 'ACTIVE':
        return <Eye className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Operations</h3>
            <p className="text-sm text-gray-500 mt-1">
              {apartmentIds.length} apartment(s) selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Operation Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Operation *
            </label>
            <div className="grid grid-cols-1 gap-3">
              {operationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOperation(option.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    operation === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-white">
                      {getOperationIcon(option.value)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                    {operation === option.value && (
                      <div className="ml-auto">
                        <Check className="h-5 w-5 text-primary-600" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for bulk operation..."
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-2">
              This reason will apply to all selected apartments.
            </p>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800 mb-1">Important Notice</div>
                <div className="text-sm text-yellow-700">
                  This operation will affect {apartmentIds.length} apartment(s). 
                  Once confirmed, this action cannot be undone individually.
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkOperation}
              disabled={!operation || isSubmitting}
              loading={isSubmitting}
              variant="primary"
            >
              Confirm Bulk Operation
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
