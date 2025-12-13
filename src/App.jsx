import React from "react";
import { BrowserRouter , Routes, Route } from "react-router-dom";
import Landing from "./Landing/Landing";
import Login from "./Login/Login";
import Register from "./Register/Register";
import Dashboard from "./Dashboard/Dashboard";
import PaymentSelection from "./Payment/PaymentSelection";
import Logout from "./Logout/Logout";



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/payment" element={<PaymentSelection />} /> 
        <Route path="/logout" element={<Logout />} />
 
      </Routes>
    </BrowserRouter>
  );
}

export default App;
