// ReactDocs.jsx
// Offline React.js documentation - reference & examples
// Read in VSCode or render it if you want

import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  forwardRef,
} from "react";

const ReactDocs = () => {
  return (
    <>
      <h1>📘 React.js Offline Documentation</h1>

      <section>
        <h2>🔷 What is React?</h2>
        <p>
          React is a JavaScript library for building declarative,
          component-based user interfaces. You write UI as functions of state.
        </p>
      </section>

      <section>
        <h2>🔷 Getting Started</h2>
        <p>
          Use <code>create-react-app</code> or <code>vite</code> to scaffold
          projects:
          <pre>npx create-react-app my-app</pre>
          <pre>npm create vite@latest my-app</pre>
        </p>
      </section>

      <section>
        <h2>🔷 JSX</h2>
        <p>
          JSX lets you embed HTML-like syntax in JS. Always return a single
          parent element.
        </p>
        <pre>
          {`
const element = <h1>Hello</h1>;
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Components</h2>
        <p>
          Components are reusable UI blocks. Always start names with uppercase.
          Props pass data into components.
        </p>

        <h3>Types of Components</h3>
        <ul>
          <li>
            <strong>Functional Components</strong> — recommended.
          </li>
          <li>
            <strong>Class Components</strong> — older, supports lifecycle
            methods.
          </li>
          <li>
            <strong>Higher Order Components (HOC)</strong> — function that takes
            a component and returns a new one.
          </li>
          <li>
            <strong>Render Props</strong> — pass a function as prop to share
            logic.
          </li>
        </ul>

        <h3>Lifecycle Methods (Class)</h3>
        <ul>
          <li>
            <code>componentDidMount</code> — after render
          </li>
          <li>
            <code>componentDidUpdate</code> — after update
          </li>
          <li>
            <code>componentWillUnmount</code> — before destroy
          </li>
        </ul>

        <h3>Best Practices</h3>
        <ul>
          <li>Keep components small & focused</li>
          <li>Use props for input, emit events via callbacks</li>
          <li>Avoid side effects in render</li>
        </ul>
      </section>

      <section>
        <h2>🔷 State</h2>
        <p>
          State is internal data that changes over time. State updates trigger
          re-render.
        </p>
        <pre>
          {`
const [count, setCount] = useState(0);
setCount(prev => prev + 1); // recommended
`}
        </pre>

        <h3>Derived State</h3>
        <p>
          Avoid duplicating props in state. Compute derived values in render.
        </p>

        <h3>Global State</h3>
        <p>For app-wide state, use Context API, Redux, Zustand, or Jotai.</p>
      </section>

      <section>
        <h2>🔷 Calling API Functions</h2>
        <p>
          Use <code>useEffect</code> to fetch data on mount. Manage loading &
          error states.
        </p>
        <pre>
          {`
function DataFetcher() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://api.example.com/data")
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
`}
        </pre>

        <h3>With Axios</h3>
        <pre>
          {`
import axios from "axios";

useEffect(() => {
  axios.get("/api").then(res => setData(res.data));
}, []);
`}
        </pre>

        <h3>Best Practices</h3>
        <ul>
          <li>Abort fetch on unmount (use AbortController)</li>
          <li>Use libraries: SWR, React Query for caching, retries, etc.</li>
        </ul>
      </section>

      <section>
        <h2>🔷 Refs</h2>
        <p>Refs let you directly access DOM nodes or persist values.</p>
        <pre>
          {`
const inputRef = useRef();

<input ref={inputRef} />
<button onClick={() => inputRef.current.focus()}>Focus</button>
`}
        </pre>
      </section>

      <section>
        <h2>🔷 forwardRef</h2>
        <p>Allows a parent to pass a ref to a child component.</p>
        <pre>
          {`
const MyInput = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Portals</h2>
        <p>
          Render a child into a different part of the DOM (useful for modals).
        </p>
        <pre>
          {`
import ReactDOM from "react-dom";

ReactDOM.createPortal(<Modal />, document.getElementById("modal-root"));
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Error Boundaries</h2>
        <p>Catch JS errors in components tree.</p>
        <pre>
          {`
class ErrorBoundary extends React.Component {
  constructor() {
    super();
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    return this.state.hasError ? <p>Error!</p> : this.props.children;
  }
}
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Suspense & Lazy</h2>
        <p>Code-splitting and fallback loading UI.</p>
        <pre>
          {`
const LazyComponent = React.lazy(() => import("./LazyComponent"));

<Suspense fallback={<p>Loading...</p>}>
  <LazyComponent />
</Suspense>
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Memoization</h2>
        <p>Optimize renders by caching values/functions.</p>
        <pre>
          {`
const memoizedValue = useMemo(() => expensiveFn(a), [a]);
const memoizedFn = useCallback(() => doSomething(), []);
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Testing</h2>
        <p>Use Jest + React Testing Library for unit/integration tests.</p>
        <pre>
          {`
import { render, screen } from "@testing-library/react";

test("renders heading", () => {
  render(<App />);
  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
`}
        </pre>
      </section>

      <section>
        <h2>🔷 Deployment</h2>
        <p>
          Run <code>npm run build</code> and deploy build folder to Netlify,
          Vercel, or static hosting.
        </p>
      </section>

      <section>
        <h2>📌 Best Practices Summary</h2>
        <ul>
          <li>Split UI into small, testable components</li>
          <li>Use keys in lists</li>
          <li>Never mutate state directly</li>
          <li>
            Keep side effects inside <code>useEffect</code>
          </li>
          <li>Use Context or global state library for app-wide state</li>
          <li>
            Code-split large apps using <code>React.lazy</code>
          </li>
          <li>Write tests for critical flows</li>
        </ul>
      </section>

      <footer>
        <p>
          © 2025 Offline React Docs by Abdul Rafay. Keep building and learning!
        </p>
      </footer>
    </>
  );
};

export default ReactDocs;
