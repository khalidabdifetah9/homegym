import Register from "@/Components/Register/Register";

export default async function RegisterPage({ params }) {
  const { serial } = await params;

  let initialSerial = "";
  try {
    initialSerial = decodeURIComponent(serial?.[0] ?? "").trim().toUpperCase();
  } catch {
  }

  return <Register initialSerial={initialSerial} />;
}