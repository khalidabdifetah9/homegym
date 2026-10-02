import React from "react";
import Navbar from "@/Components/Landing/Navbar";
const AdminLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default AdminLayout;
