import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-surface! text-ink! border-line! shadow-ticket! rounded-xl!",
          description: "text-ink-faint!",
          actionButton: "bg-primary! text-white!",
          cancelButton: "bg-ink/5! text-ink-faint!",
          success: "border-success/30!",
          error: "border-danger/30!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }