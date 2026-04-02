import { createBrowserRouter } from "react-router-dom";

function App() {

  const router = createBrowserRouter([
    path: '/',
    element: <Dashboard />,
  ])

  return (
    <>
      <h1>hello world</h1>
    </>
  );
}

export default App;
