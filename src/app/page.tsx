"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginPage from "./components/LoginPage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLoginSuccess = (userId: string, email: string) => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("email", email);
    router.push("/dashboard");
  };

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}
