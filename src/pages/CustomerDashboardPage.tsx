import {
  Headset,
  User,
  Mail,
  Phone,
  LogOut,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

import {
  useCustomerAuth,
} from "../hooks/useCustomerAuth";

export default function CustomerDashboardPage() {
  const {
    customer,
    logout,
  } = useCustomerAuth();

  if (!customer) {
    return null;
  }

  const profileItems = [
    {
      label: "Full Name",
      value: customer.name,
      icon: User,
    },
    {
      label: "Email Address",
      value: customer.email,
      icon: Mail,
    },
    {
      label: "Phone Number",
      value: customer.phone || "Not provided",
      icon: Phone,
    },
    {
      label: "Account Status",
      value: customer.is_active
        ? "Active Customer"
        : "Inactive Customer",
      icon: ShieldCheck,
    },
    {
      label: "Account Role",
      value: "Customer",
      icon: User,
    },
    {
      label: "Member Since",
      value: new Date(
        customer.created_at
      ).toLocaleDateString(),
      icon: CalendarDays,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white">
              <Headset size={24} />
            </div>

            <div>
              <h1 className="font-bold text-gray-900">
                Customer Portal
              </h1>

              <p className="text-xs text-gray-500">
                AI Customer Support
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LogOut size={16} />

            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl bg-blue-600 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-bold">
            Welcome, {customer.name}
          </h2>

          <p className="mt-2 text-sm text-blue-100">
            Manage your customer support experience
            from one place.
          </p>
        </div>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <User size={24} />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Account Information
              </h3>

              <p className="text-xs text-gray-500">
                Authenticated customer profile
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profileItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-lg bg-gray-50 p-4"
                >
                  <div className="flex items-center gap-2 text-gray-500">
                    <Icon size={16} />

                    <span className="text-xs">
                      {item.label}
                    </span>
                  </div>

                  <p className="mt-2 break-words text-sm font-medium text-gray-900">
                    {item.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={20}
              className="text-green-600"
            />

            <h3 className="font-semibold text-green-900">
              Customer Authentication Active
            </h3>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-green-700">
            Your customer session has been verified.
            Authentication is managed through the
            CustomerAuthProvider.
          </p>
        </div>
      </main>
    </div>
  );
}