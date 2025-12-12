"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, Settings, Check, AlertCircle } from "lucide-react";
import MFASetupFlow from "../components/MFASetupFlow";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user from localStorage (set after login)
    const storedUserId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("email");

    if (!storedUserId) {
      router.push("/");
      return;
    }

    setUserId(storedUserId);
    checkMFAStatus(storedUserId);
  }, [router]);

  const checkMFAStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/mfa/status?userId=${userId}`);
      const data = await response.json();
      setMfaEnabled(data.enabled);
    } catch (error) {
      console.error("Error checking MFA status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    router.push("/");
  };

  const handleMfaSetupComplete = () => {
    setShowMfaSetup(false);
    if (userId) {
      checkMFAStatus(userId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (showMfaSetup) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={() => setShowMfaSetup(false)}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
          >
            <span>← Quay lại Dashboard</span>
          </button>
        </div>
        <MFASetupFlow onComplete={handleMfaSetupComplete} userId={userId!} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {localStorage.getItem("email")}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Bảo mật tài khoản
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quản lý cài đặt bảo mật của bạn
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Xác thực hai yếu tố (MFA)
                    </p>
                    <p className="text-sm text-gray-600">
                      {mfaEnabled
                        ? "Đã bật - Tài khoản của bạn được bảo vệ"
                        : "Chưa bật - Bảo vệ tài khoản của bạn"}
                    </p>
                  </div>
                </div>
                {mfaEnabled ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Check className="w-5 h-5" />
                    <span className="text-sm font-medium">Đã bật</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-amber-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Chưa bật</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowMfaSetup(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>
                  {mfaEnabled ? "Quản lý MFA" : "Thiết lập MFA"}
                </span>
              </button>
            </div>
          </div>

          {/* Account Info Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin tài khoản
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">
                  {localStorage.getItem("email")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User ID</p>
                <p className="font-medium text-gray-900 font-mono text-sm">
                  {userId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Chào mừng đến với Demo MFA!
          </h3>
          <p className="text-blue-800 text-sm">
            Đây là một ứng dụng demo đầy đủ tính năng cho xác thực hai yếu tố
            (MFA). Bạn có thể thiết lập MFA, đăng nhập với mã xác thực, và quản
            lý các mã khôi phục.
          </p>
        </div>
      </div>
    </div>
  );
}

