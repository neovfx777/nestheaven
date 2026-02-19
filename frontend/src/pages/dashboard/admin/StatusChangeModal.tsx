import React, { useState } from 'react';
import { X, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Textarea } from '../../../components/ui/Textarea';
import { Select } from '../../../components/ui/Select';
import { useTranslation } from '../../../hooks/useTranslation';

interface StatusChangeModalProps {
  apartmentId: string;
  currentStatus: string;
  onClose: () => void;
  onStatusChange: (apartmentId: string, status: string, reason?: string) => void;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  apartmentId,
  currentStatus,
  onClose,
  onStatusChange,
}) => {
  const { t } = useTranslation();
  const normalizedCurrent = currentStatus?.toUpperCase() || '';
  const [status, setStatus] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: 'ACTIVE', label: t('statusChange.active'), description: t('statusChange.activeDescription') },
    { value: 'HIDDEN', label: t('statusChange.hidden'), description: t('statusChange.hiddenDescription') },
  ].filter(option => option.value !== normalizedCurrent);

  const handleSubmit = async () => {
    if (!status) {
      alert(t('messages.selectStatus'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(apartmentId, status, reason || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (statusValue: string) => {
    switch (statusValue) {
      case 'ACTIVE':
        return <Eye className="h-5 w-5 text-green-600" />;
      case 'HIDDEN':
        return <EyeOff className="h-5 w-5 text-gray-600" />;
      case 'SOLD':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getActionDescription = () => {
    if (!status) return '';
    
    const from = normalizedCurrent.toLowerCase();
    const to = status.toLowerCase();
    
    const descriptions: Record<string, string> = {
      'active->hidden': 'Hiding this apartment will remove it from public listings.',
      'hidden->active': 'Unhiding will make this apartment visible to users.',
      'sold->active': 'Changing from sold back to active.',
      'sold->hidden': 'Hiding a sold apartment.',
    };
    
    const key = `${currentStatus.toLowerCase()}->${status.toLowerCase()}`;
    return descriptions[key] || `Changing status from ${from} to ${to}.`;
  };

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Change Apartment Status</h3>
            <p className="text-sm text-gray-500 mt-1">
              Apartment ID: <span className="font-mono">{apartmentId.slice(0, 8)}...</span>
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
          {/* Current Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                {getStatusIcon(currentStatus)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600">Current Status</div>
                <div className="text-lg font-semibold text-gray-900 capitalize">
                  {currentStatus.toLowerCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    status === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-full bg-white">
                      {getStatusIcon(option.value)}
                    </div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Reason (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Change (Optional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for status change..."
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-2">
              This will be recorded in the status history log.
            </p>
          </div>

          {/* Warning Message */}
          {status && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800 mb-1">Action Required</div>
                  <div className="text-sm text-yellow-700">
                    {getActionDescription()}
                    <div className="mt-2 font-medium">
                      Are you sure you want to proceed?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              onClick={handleSubmit}
              disabled={!status || isSubmitting}
              loading={isSubmitting}
            >
              Change Status
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
