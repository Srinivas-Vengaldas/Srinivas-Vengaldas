import { Component } from "react";

// Keeps the page readable if a 3D scene fails (no WebGL, a lazy chunk fails to load, a runtime error).
export default class SafeBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("3D scene disabled:", error);
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
