import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * The last line of defence: if any part of the interface fails to render, the visitor
 * sees a calm message and a way forward instead of an empty page.
 */
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The page could not be displayed.', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="page page--centred" role="alert">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="display">This page could not be displayed.</h1>
        <p className="lede">Reloading usually fixes it. If it does not, the list of sets is always available.</p>
        <div className="intro-actions">
          <button type="button" className="button button--solid" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          <a href="/sets" className="button button--outline">
            View All Sets
          </a>
        </div>
      </main>
    )
  }
}
