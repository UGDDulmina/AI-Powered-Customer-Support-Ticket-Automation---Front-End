import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import AgentSidebar from "../admin/agents/agentSidebar";
import AgentHeader from "../admin/agents/agentHeader";

const AgentLayout = () => {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);

  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (sidebarOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!sidebarOpen && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(min-width: 1024px)"
    );

    const handleResize = (
      event: MediaQueryListEvent
    ) => {
      if (event.matches) {
        setSidebarOpen(false);
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
    <div className="min-h-screen bg-slate-50">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <AgentSidebar />
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Agent navigation"
        onCancel={(event) => {
          event.preventDefault();
          setSidebarOpen(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setSidebarOpen(false);
          }
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 backdrop:bg-slate-900/60"
      >
        <div className="h-full w-64 shadow-2xl">
          <AgentSidebar
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      </dialog>

      <div className="min-h-screen min-w-0 lg:ml-64">
        <AgentHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AgentLayout;