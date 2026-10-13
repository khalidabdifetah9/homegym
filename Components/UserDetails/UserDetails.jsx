import UserDetailsForm from "./UserDetailsForm";
import UserDetailsGallery from "./UserDetailsGallery";

export default function UserDetails({ onSaved }) {
  return (
    <main className="min-h-svh bg-black font-poppins text-white lg:grid lg:grid-cols-2">
      <UserDetailsForm onSaved={onSaved} />
      <UserDetailsGallery />
    </main>
  );
}