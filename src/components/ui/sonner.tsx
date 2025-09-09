import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground group-[.toaster]:border-primary group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-primary-foreground/90",
          actionButton:
            "group-[.toast]:bg-primary-foreground group-[.toast]:text-primary hover:group-[.toast]:bg-primary-foreground/90",
          cancelButton:
            "group-[.toast]:bg-primary-foreground/20 group-[.toast]:text-primary-foreground hover:group-[.toast]:bg-primary-foreground/30",
        },
        style: {
          zIndex: 2147483647,
        }
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
