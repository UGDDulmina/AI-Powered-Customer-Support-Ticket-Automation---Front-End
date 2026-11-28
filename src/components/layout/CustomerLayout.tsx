import {
  useEffect,
  useRef,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerHeader from "../../components/customer/CustomerHeader";

export default function CustomerLayout() {
  const dialogRef =
    useRef<HTMLDialogElement>(null);

  const location = useLocation();

  const openMenu = () => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  };

  const closeMenu = () => {
    dialogRef.current?.close();
  };

  useEffect(() => {
    dialogRef.current?.close();
  }, [location.pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px)"
    );

    const handleResize = () => {
      if (mediaQuery.matches) {
        dialogRef.current?.close();
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleResize
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleResize
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <CustomerSidebar />
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Customer navigation"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeMenu();
          }
        }}
        className="fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-64 max-w-none border-0 bg-transparent p-0 backdrop:bg-black/50"
      >
        <CustomerSidebar onClose={closeMenu} />
      </dialog>

      <div className="min-h-screen min-w-0 lg:ml-64">
        <CustomerHeader
          onMenuClick={openMenu}
        />

        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}