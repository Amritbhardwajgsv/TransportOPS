import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    variant = 'danger',
    loading = false,
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant={variant} onClick={onConfirm} disabled={loading}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p className="text-sm text-smoke-400">{description}</p>
        </Modal>
    );
}
