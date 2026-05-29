import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import { cn } from '@/lib/utils';

function AlertDialog({ open, onOpenChange, children }: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </AlertDialogPrimitive.Root>
  );
}

function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0" />
      <AlertDialogPrimitive.Popup
        className={cn(
          'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
          'rounded-xl border bg-card p-6 shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4 space-y-1.5', className)}>{children}</div>;
}

function AlertDialogFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-6 flex justify-end gap-2', className)}>{children}</div>;
}

function AlertDialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AlertDialogPrimitive.Title className={cn('text-base font-semibold', className)}>
      {children}
    </AlertDialogPrimitive.Title>
  );
}

function AlertDialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <AlertDialogPrimitive.Description className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </AlertDialogPrimitive.Description>
  );
}

function AlertDialogCancel({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <AlertDialogPrimitive.Close
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium hover:bg-muted transition-colors',
        className
      )}
      onClick={onClick}
    >
      {children}
    </AlertDialogPrimitive.Close>
  );
}

function AlertDialogAction({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium text-white transition-colors bg-primary hover:bg-primary/90',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
};
