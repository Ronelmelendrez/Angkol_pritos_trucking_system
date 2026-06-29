import { Component, type ErrorInfo, type ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  children: ReactNode
  /** Optional label shown in the fallback, e.g. "Expenses" */
  section?: string
}

interface State {
  hasError: boolean
}

/**
 * Catches render errors in a subtree (e.g. a single page) so one broken
 * feature doesn't take down the whole app. Wrap each route's page component.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto mt-8 max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-annatto-100">
              <AlertTriangle className="size-6 text-annatto-500" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-char-900">
                Something went wrong
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {this.props.section
                  ? `We couldn't load ${this.props.section}. Try again, or refresh the page.`
                  : "This part of the app hit an unexpected error. Try again, or refresh the page."}
              </p>
            </div>
            <Button onClick={this.handleReset} className="mt-2">
              Try again
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}