import { useToast } from "@/hooks/use-toast.jsx"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-primary text-primary-foreground border-primary">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-primary-foreground">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-primary-foreground/90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-primary-foreground hover:text-primary-foreground/80" />
          </Toast>
        )
      })}
      <ToastViewport className="fixed top-0 z-[2147483647] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
