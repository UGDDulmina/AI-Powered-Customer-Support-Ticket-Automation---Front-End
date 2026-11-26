import { useState } from "react";

import { Outlet } from "react-router-dom";

import AdminSidebar from
  "../../components/admin/adminSidebar";

import AdminHeader from
  "../../components/admin/adminHeader";


const AdminLayout = () => {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  const openSidebar = () => {

    setSidebarOpen(true);

  };


  const closeSidebar = () => {

    setSidebarOpen(false);

  };


  return (

    <div className="min-h-screen bg-slate-100">

      

      <div className="fixed inset-y-0 left-0
                      z-40 hidden lg:block">

        <AdminSidebar />

      </div>


    

      {sidebarOpen && (

        <div className="fixed inset-0
                        z-50 lg:hidden">



          <button
            type="button"
            className="absolute inset-0
                       bg-black/50"
            aria-label="Close navigation"
            onClick={closeSidebar}
          />


    

          <div className="relative h-full
                          w-64">

            <AdminSidebar
              onClose={closeSidebar}
            />

          </div>

        </div>

      )}


    

      <div className="min-h-screen lg:ml-64">



        <AdminHeader
          onMenuClick={openSidebar}
        />




        <main className="p-4 lg:p-6">

          <Outlet />

        </main>

      </div>

    </div>

  );

};


export default AdminLayout;