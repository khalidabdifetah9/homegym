import Sidebar from "@/Components/dashboard/Sidebar/sideBar";

export const metadata = {
  title: "Precision Training Hub | ወንዳወንድ Home Gym",
  description:
    "Unlock the full potential of your home gym bench. Access step by step form guides, tailored set counts, and bench angle configurations customized specifically to your age and weight",
  other: { "color-scheme": "only light" },
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-svh overflow-x-hidden bg-[#0a0a0a] text-white">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
