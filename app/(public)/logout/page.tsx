"use client";
import { useAuthStore } from "@/app/stores/auth.store";
import { useRouter } from "next/navigation";


export default function LogoutButton() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/"); // 👈 redirect to homepage
  };

  return <button  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" onClick={handleLogout}>Logout</button>;
}
