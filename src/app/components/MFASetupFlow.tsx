"use client";

import {
  AlertCircle,
  Check,
  ChevronRight,
  Copy,
  Download,
  Key,
  Loader2,
  Shield,
  Smartphone,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import React, { useState } from "react";

interface MFASetupFlowProps {
  userId: string;
  onComplete?: () => void;
}

interface MFASetupFlowState {
  currentScreen: number;
  otpInput: string;
  savedCodes: boolean;
  copiedSecret: boolean;
  copiedBackup: boolean;
  loading: boolean;
  error: string;
  secretKey: string;
  backupCodes: string[];
  generatingSecret: boolean;
}

const MFASetupFlowObject = {
  api: {
    generateSecret: async (userId: string) => {
      const response = await fetch("/api/mfa/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate secret");
      }
      return data;
    },
    verifyToken: async (userId: string, token: string) => {
      const response = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Invalid token");
      }
      return data;
    },
    enableMFA: async (userId: string, token: string) => {
      const response = await fetch("/api/mfa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to enable MFA");
      }
      return data;
    },
  },
  utils: {
    generateTOTPURI: (secretKey: string, userEmail: string) => {
      if (!secretKey) return "";
      const issuer = "Demo App";
      const account = userEmail;
      const encodedIssuer = encodeURIComponent(issuer);
      const encodedAccount = encodeURIComponent(account);
      return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secretKey}&issuer=${encodedIssuer}`;
    },
    copyToClipboard: async (text: string) => {
      await navigator.clipboard.writeText(text);
    },
    downloadBackupCodes: (backupCodes: string[]) => {
      const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mfa-backup-codes.txt";
      a.click();
    },
  },
  handlers: {
    handleStartSetup: async (
      userId: string,
      setState: (updates: Partial<MFASetupFlowState>) => void
    ) => {
      setState({ generatingSecret: true, error: "" });
      try {
        const data = await MFASetupFlowObject.api.generateSecret(userId);
        setState({
          secretKey: data.secret,
          backupCodes: data.backupCodes,
          currentScreen: 3,
          generatingSecret: false,
        });
      } catch (error) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : "An error occurred. Please try again.",
          generatingSecret: false,
        });
      }
    },
    handleVerifyOTP: async (
      userId: string,
      token: string,
      setState: (updates: Partial<MFASetupFlowState>) => void
    ) => {
      setState({ loading: true, error: "" });
      try {
        await MFASetupFlowObject.api.verifyToken(userId, token);
        await MFASetupFlowObject.api.enableMFA(userId, token);
        setState({ currentScreen: 5, loading: false });
      } catch (error) {
        setState({
          error:
            error instanceof Error
              ? error.message
              : "Đã xảy ra lỗi. Vui lòng thử lại.",
          loading: false,
        });
      }
    },
    handleCopySecret: (
      secretKey: string,
      setState: (updates: Partial<MFASetupFlowState>) => void
    ) => {
      MFASetupFlowObject.utils.copyToClipboard(secretKey);
      setState({ copiedSecret: true });
      setTimeout(() => setState({ copiedSecret: false }), 2000);
    },
    handleCopyBackup: (
      backupCodes: string[],
      setState: (updates: Partial<MFASetupFlowState>) => void
    ) => {
      MFASetupFlowObject.utils.copyToClipboard(backupCodes.join("\n"));
      setState({ copiedBackup: true });
      setTimeout(() => setState({ copiedBackup: false }), 2000);
    },
    handleDownloadBackup: (backupCodes: string[]) => {
      MFASetupFlowObject.utils.downloadBackupCodes(backupCodes);
    },
  },
  ui: {},
};

const MFASetupFlow = ({ userId, onComplete }: MFASetupFlowProps) => {
  const [currentScreen, setCurrentScreen] = useState(1);
  const [otpInput, setOtpInput] = useState("");
  const [savedCodes, setSavedCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [generatingSecret, setGeneratingSecret] = useState(false);

  const userEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("email") || "user@example.com"
      : "user@example.com";

  const totpURI = MFASetupFlowObject.utils.generateTOTPURI(
    secretKey,
    userEmail
  );

  const setState = (updates: Partial<MFASetupFlowState>) => {
    if (updates.currentScreen !== undefined)
      setCurrentScreen(updates.currentScreen);
    if (updates.otpInput !== undefined) setOtpInput(updates.otpInput);
    if (updates.savedCodes !== undefined) setSavedCodes(updates.savedCodes);
    if (updates.copiedSecret !== undefined)
      setCopiedSecret(updates.copiedSecret);
    if (updates.copiedBackup !== undefined)
      setCopiedBackup(updates.copiedBackup);
    if (updates.loading !== undefined) setLoading(updates.loading);
    if (updates.error !== undefined) setError(updates.error);
    if (updates.secretKey !== undefined) setSecretKey(updates.secretKey);
    if (updates.backupCodes !== undefined) setBackupCodes(updates.backupCodes);
    if (updates.generatingSecret !== undefined)
      setGeneratingSecret(updates.generatingSecret);
  };

  // Screen 1: Security Settings
  const SecuritySettings = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Cài đặt Bảo mật
        </h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Xác thực hai yếu tố (MFA)
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Tăng cường bảo mật tài khoản bằng cách yêu cầu mã xác thực từ
                thiết bị di động của bạn
              </p>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                Chưa kích hoạt
              </span>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen(2)}
            className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>Bật xác thực hai yếu tố</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Screen 2: MFA Introduction
  const MFAIntroduction = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentScreen(1)}
          className="text-blue-600 mb-6 flex items-center hover:text-blue-700"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Thiết lập Xác thực Hai Yếu tố
            </h2>
            <p className="text-gray-600">
              Bảo vệ tài khoản của bạn với lớp bảo mật bổ sung
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Tải Google Authenticator
                </h4>
                <p className="text-sm text-gray-600">
                  Cài đặt ứng dụng Google Authenticator từ App Store hoặc Google
                  Play
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quét mã QR</h4>
                <p className="text-sm text-gray-600">
                  Sử dụng ứng dụng để quét mã QR chúng tôi cung cấp
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Xác nhận thiết lập
                </h4>
                <p className="text-sm text-gray-600">
                  Nhập mã 6 số từ ứng dụng để hoàn tất
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Lưu ý quan trọng:</p>
                <p>
                  Bạn sẽ cần điện thoại mỗi khi đăng nhập. Hãy đảm bảo lưu trữ
                  mã khôi phục để truy cập tài khoản khi cần thiết.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              MFASetupFlowObject.handlers.handleStartSetup(userId, setState)
            }
            disabled={generatingSecret}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {generatingSecret ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tạo mã bảo mật...</span>
              </>
            ) : (
              <span>Bắt đầu thiết lập</span>
            )}
          </button>
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Screen 3: QR Code Display
  const QRCodeDisplay = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentScreen(2)}
          className="text-blue-600 mb-6 flex items-center hover:text-blue-700"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Quét mã QR
            </h2>
            <p className="text-gray-600">
              Mở Google Authenticator và quét mã này
            </p>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="bg-white p-6 rounded-xl border-4 border-gray-200 mb-6">
              <div className="w-64 h-64 flex items-center justify-center rounded-lg">
                {secretKey ? (
                  <QRCodeSVG
                    value={totpURI}
                    size={256}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="text-gray-400">Đang tải...</div>
                )}
              </div>
            </div>

            <div className="w-full max-w-md">
              <p className="text-sm text-gray-700 font-medium mb-2">
                Hoặc nhập mã thủ công:
              </p>
              <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <code className="flex-1 text-center font-mono text-lg text-gray-900 select-all">
                  {secretKey || "Đang tải..."}
                </code>
                <button
                  onClick={() =>
                    MFASetupFlowObject.handlers.handleCopySecret(
                      secretKey,
                      setState
                    )
                  }
                  className="p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Sao chép mã"
                >
                  {copiedSecret ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Hướng dẫn:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Mở ứng dụng Google Authenticator</li>
                  <li>Nhấn vào nút "+" hoặc "Thêm tài khoản"</li>
                  <li>Chọn "Quét mã QR" và quét mã bên trên</li>
                  <li>Hoặc chọn "Nhập khóa thiết lập" và dán mã thủ công</li>
                </ol>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen(4)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Đã quét xong, tiếp tục
          </button>
        </div>
      </div>
    </div>
  );

  // Screen 4: OTP Verification
  const OTPVerification = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setCurrentScreen(3)}
          className="text-blue-600 mb-6 flex items-center hover:text-blue-700"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
              <Key className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Xác nhận mã xác thực
            </h2>
            <p className="text-gray-600">
              Nhập mã 6 số từ Google Authenticator
            </p>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã xác thực
            </label>
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full text-center text-3xl font-mono tracking-widest px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Mã sẽ thay đổi mỗi 30 giây
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              if (otpInput.length === 6) {
                MFASetupFlowObject.handlers.handleVerifyOTP(
                  userId,
                  otpInput,
                  setState
                );
              }
            }}
            disabled={otpInput.length !== 6 || loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <span>Xác nhận</span>
            )}
          </button>

          <div className="mt-6 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Không nhận được mã?
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Screen 5: Backup Codes
  const BackupCodes = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-amber-100 rounded-full mb-4">
              <Key className="w-12 h-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lưu mã khôi phục
            </h2>
            <p className="text-gray-600">
              Sử dụng các mã này khi bạn không thể truy cập thiết bị của mình
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Quan trọng!</p>
                <p>
                  Mỗi mã chỉ có thể sử dụng một lần. Hãy lưu trữ chúng ở nơi an
                  toàn và không chia sẻ với bất kỳ ai.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded border border-gray-200"
                >
                  <code className="text-sm font-mono text-gray-900">
                    {code}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 mb-6">
            <button
              onClick={() =>
                MFASetupFlowObject.handlers.handleCopyBackup(
                  backupCodes,
                  setState
                )
              }
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {copiedBackup ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    Đã sao chép
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Sao chép</span>
                </>
              )}
            </button>
            <button
              onClick={() =>
                MFASetupFlowObject.handlers.handleDownloadBackup(backupCodes)
              }
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Tải xuống</span>
            </button>
          </div>

          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={savedCodes}
                onChange={(e) => setSavedCodes(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Tôi đã lưu các mã khôi phục này ở nơi an toàn và hiểu rằng tôi
                sẽ không thể xem lại chúng sau bước này.
              </span>
            </label>
          </div>

          <button
            onClick={() => {
              if (savedCodes) {
                setCurrentScreen(6);
              }
            }}
            disabled={!savedCodes}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Hoàn tất thiết lập
          </button>
        </div>
      </div>
    </div>
  );

  // Screen 6: Success
  const Success = () => (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
            <Check className="w-16 h-16 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Thiết lập thành công!
          </h2>
          <p className="text-gray-600 mb-8">
            Tài khoản của bạn giờ đây được bảo vệ bằng xác thực hai yếu tố
          </p>

          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-4">
              Những gì bạn vừa thiết lập:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Kết nối Google Authenticator với tài khoản
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Lưu trữ 8 mã khôi phục dự phòng
                </span>
              </li>
              <li className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">
                  Bảo mật tài khoản với lớp xác thực bổ sung
                </span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-amber-800">
              <strong>Lưu ý:</strong> Từ lần đăng nhập tiếp theo, bạn sẽ cần
              nhập mã từ Google Authenticator cùng với mật khẩu của mình.
            </p>
          </div>

          <button
            onClick={() => {
              if (onComplete) {
                onComplete();
              } else {
                setCurrentScreen(1);
              }
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            {onComplete ? "Quay lại Dashboard" : "Quay lại Cài đặt"}
          </button>
        </div>
      </div>
    </div>
  );

  // Screen Navigation
  const screens: Record<number, React.ReactElement> = {
    1: <SecuritySettings />,
    2: <MFAIntroduction />,
    3: <QRCodeDisplay />,
    4: <OTPVerification />,
    5: <BackupCodes />,
    6: <Success />,
  };

  return (
    <div className="relative">
      {/* Progress Indicator */}
      {currentScreen > 1 && currentScreen < 6 && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="max-w-2xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Bước {currentScreen - 1} / 4
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(((currentScreen - 1) / 4) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentScreen - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className={currentScreen > 1 && currentScreen < 6 ? "pt-20" : ""}>
        {screens[currentScreen]}
      </div>
    </div>
  );
};

export default MFASetupFlow;
