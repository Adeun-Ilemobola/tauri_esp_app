import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/page/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
       { index: true, element: <App /> }, 
      
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
     <RouterProvider router={router} />
  </React.StrictMode>,
);
