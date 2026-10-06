import Sidebar from "@/Components/Admin/Sidebar/sideBar";

export const metadata = {
  title: "Hardware & Catalog Management | ወንዳወንድ Home Gym",
  description:
    "Manage products, update equipment details, and generate secure serial QR codes for factory printing.",
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
