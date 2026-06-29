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
            "group toast bg-card! text-card-foreground! border-border! shadow-ticket-lg! rounded-lg!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-muted! text-muted-foreground!",
          success: "border-success-500/30!",
          error: "border-destructive/30!",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }