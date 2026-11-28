import {
  UserRound,
  Mail,
  ShieldCheck,
  CircleCheck,
  Fingerprint,
} from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const AgentProfilePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Profile information is unavailable.
      </div>
    );
  }

  const initials =
    user.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase() || "SA";

  const profileFields = [
    {
      label: "Full Name",
      value: user.name,
      icon: UserRound,
    },
    {
      label: "Email Address",
      value: user.email,
      icon: Mail,
    },
    {
      label: "Agent ID",
      value: `#${user.id}`,
      icon: Fingerprint,
    },
    {
      label: "Account Role",
      value: "Support Agent",
      icon: ShieldCheck,
    },
    {
      label: "Account Status",
      value: user.is_active ? "Active" : "Inactive",
      icon: CircleCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          My Profile
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          View your support agent account information.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-blue-700 to-indigo-600" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-semibold text-blue-700">
              {initials}
            </div>

            <div className="pb-1">
              <h3 className="text-xl font-semibold text-slate-900">
                {user.name}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Support Agent
              </p>
            </div>
          </div>

          <div className="mt-5">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                user.is_active
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <CircleCheck size={15} />
              {user.is_active ? "Active Account" : "Inactive Account"}
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-semibold text-slate-800">
            Personal Information
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Information associated with your account.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          {profileFields.map((field) => {
            const Icon = field.icon;

            return (
              <div
                key={field.label}
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Icon size={21} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    {field.label}
                  </p>

                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {field.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default AgentProfilePage;