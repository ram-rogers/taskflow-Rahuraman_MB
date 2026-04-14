import { X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmModal({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDanger = true
}: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
        
        <div className="modal-header">
          <h3 className={isDanger ? 'text-danger flex items-center gap-2' : ''}>
            {title}
          </h3>
          <button className="icon-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body text-txsecondary pb-6">
          {message}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            className={`btn ${isDanger ? 'btn-danger' : 'btn-primary'} min-w-[100px]`} 
            onClick={() => {
              onConfirm();
              onCancel(); // auto close on confirm action
            }}
          >
            {confirmText}
          </button>
        </div>
        
      </div>
    </div>
  );
}
