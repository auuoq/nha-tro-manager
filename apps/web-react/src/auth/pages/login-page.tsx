import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/auth/hooks/use-auth";
import { Eye, EyeOff, Building2 } from "lucide-react";

/* Compact High-Fashion Artistic Boutique Crest Logo */
const VKArtisticCrestLogo = ({ className = "w-[44px] h-[50px]" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="artisticGold" x1="10" y1="5" x2="60" y2="75" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF9EE" />
        <stop offset="45%" stopColor="#E6D7C3" />
        <stop offset="85%" stopColor="#C8B8A8" />
        <stop offset="100%" stopColor="#9E8D7C" />
      </linearGradient>

      <linearGradient id="crestTileGrad" x1="0" y1="0" x2="70" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#222F29" />
        <stop offset="50%" stopColor="#16201B" />
        <stop offset="100%" stopColor="#0E1411" />
      </linearGradient>
    </defs>

    {/* Compact Architectural Crest Frame */}
    <path d="M 12 10 Q 35 3 58 10 Q 65 10 65 18 V 62 Q 65 76 35 76 Q 5 76 5 62 V 18 Q 5 10 12 10 Z" fill="url(#crestTileGrad)" stroke="url(#artisticGold)" strokeWidth="1.1" />

    {/* Inner Dotted Accent Ring */}
    <path d="M 15 13 Q 35 7 55 13 Q 61 13 61 20 V 60 Q 61 72 35 72 Q 9 72 9 60 V 20 Q 9 13 15 13 Z" stroke="url(#artisticGold)" strokeWidth="0.5" opacity="0.35" strokeDasharray="2.5 2" />

    {/* Top Sparkle Accent */}
    <path d="M 35 8 L 36.2 11.8 L 40 13 L 36.2 14.2 L 35 18 L 33.8 14.2 L 30 13 L 33.8 11.8 Z" fill="#FFF9EE" />

    {/* ARTISTIC EDITORIAL HIGH-FASHION MONOGRAM: V & K */}
    {/* Letter V */}
    <path d="M 17 28 H 25" stroke="url(#artisticGold)" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M 21 28 L 27.5 53" stroke="url(#artisticGold)" strokeWidth="3" strokeLinecap="round" />
    <path d="M 27.5 53 C 31 42, 35 34, 38.5 28" stroke="url(#artisticGold)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 35 28 H 41" stroke="url(#artisticGold)" strokeWidth="1.6" strokeLinecap="round" />

    {/* Letter K */}
    <path d="M 39 27 V 53" stroke="url(#artisticGold)" strokeWidth="2.8" strokeLinecap="round" />
    <path d="M 36 27 H 42 M 36 53 H 42" stroke="url(#artisticGold)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 39 41 Q 45 34 52 28" stroke="url(#artisticGold)" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M 47 28 H 54" stroke="url(#artisticGold)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M 39.5 39 C 44 45, 48 51, 54 53" stroke="url(#artisticGold)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="54" cy="53" r="1.3" fill="#FFF9EE" />

    {/* Bottom Diamond Accent */}
    <polygon points="35,65 37.5,67.5 35,70 32.5,67.5" fill="#FFF9EE" opacity="0.9" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(phone, password);
      if (user.role === "SUPER_ADMIN") {
        navigate("/super-admin/dashboard");
      } else if (user.role === "TENANT") {
        navigate("/tenant/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Số điện thoại hoặc mật khẩu không chính xác";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F3EE] select-none relative overflow-hidden login-page-wrapper">

      {/* Background Ambient Orbs */}
      <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-[#C8B8A8]/15 blur-[120px] pointer-events-none login-ambient-glow" />
      <div className="absolute bottom-10 right-10 w-[480px] h-[480px] rounded-full bg-[#3F594F]/12 blur-[140px] pointer-events-none login-ambient-glow" />

      {/* Card Container scaled to ~80-85% proportions */}
      <div className="bg-white rounded-3xl sm:rounded-[32px] border border-[#E8E5DF] shadow-[0_20px_60px_rgba(0,0,0,0.05)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10 transition-all login-card-container">

        {/* LEFT COLUMN: Boutique Visual Panel */}
        <div className="md:col-span-7 bg-gradient-to-br from-[#1E2622] via-[#161D1A] to-[#101412] text-[#D9DDD8] p-5 sm:p-7 lg:p-8 flex flex-col justify-between relative overflow-hidden h-full login-left-panel">

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <VKArtisticCrestLogo className="w-[230px] h-[260px] opacity-[0.025]" />
          </div>

          <div className="absolute inset-0 bg-[radial-gradient(#C8B8A8_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.05] pointer-events-none z-0" />
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gradient-to-bl from-[#C8B8A8]/20 to-transparent blur-3xl pointer-events-none login-ambient-glow" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-gradient-to-tr from-[#3F594F]/30 to-transparent blur-3xl pointer-events-none login-ambient-glow" />

          <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-[400px] rounded-[200px] bg-gradient-to-l from-[#C8B8A8]/10 via-[#3F594F]/15 to-transparent blur-2xl pointer-events-none login-ambient-glow" />

          <div className="relative z-10 space-y-1 shrink-0">
            <div className="flex items-center gap-3">
              <VKArtisticCrestLogo className="w-[42px] h-[48px] sm:w-[46px] sm:h-[52px]" />

              <div>
                <h1 className="text-xs sm:text-sm font-semibold text-white tracking-wider">NHÀ TRỌ MANAGER</h1>
                <p className="text-[9px] text-[#A3A9A1] tracking-widest uppercase font-medium">Boutique Property Platform</p>
              </div>
            </div>

            <p className="text-[11px] text-[#A3A9A1] font-light pl-0.5 pt-0.5">
              Nền tảng quản lý căn hộ dịch vụ và nhà trọ cao cấp.
            </p>
          </div>

          {/* CENTER VISUAL SCENE */}
          <div className="relative z-10 my-auto py-1 flex items-center justify-center min-h-0 flex-1 max-h-[50%] overflow-hidden">
            <div className="absolute w-56 h-56 rounded-full bg-gradient-to-b from-[#C8B8A8]/30 via-[#3F594F]/20 to-transparent blur-3xl pointer-events-none login-ambient-glow" />

            <svg className="w-full h-full max-h-[200px] text-[#C8B8A8] opacity-95 max-w-[360px] transition-transform login-illustration-svg" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="grandArchGlow" x1="200" y1="10" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C8B8A8" stopOpacity="0.35" />
                  <stop offset="60%" stopColor="#C8B8A8" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#3F594F" stopOpacity="0.05" />
                </linearGradient>
                <radialGradient id="pendantLight" cx="200" cy="45" r="75" fx="200" fy="45" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF4E5" stopOpacity="0.45" />
                  <stop offset="60%" stopColor="#C8B8A8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#C8B8A8" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="200" cy="50" r="60" fill="url(#pendantLight)" />
              <path d="M 130 200 V 70 A 70 70 0 0 1 270 70 V 200 Z" fill="url(#grandArchGlow)" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 140 195 V 70 A 60 60 0 0 1 260 70 V 195 Z" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <line x1="200" y1="0" x2="200" y2="200" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
              <line x1="140" y1="100" x2="260" y2="100" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
              <line x1="200" y1="0" x2="200" y2="38" stroke="currentColor" strokeWidth="1.6" />
              <path d="M 188 48 L 200 38 L 212 48 Z" fill="currentColor" opacity="0.9" />
              <circle cx="200" cy="52" r="3.5" fill="#FFF8EE" />
              <path d="M 130 20 C 150 45, 145 110, 130 190" stroke="currentColor" strokeWidth="1.4" opacity="0.5" fill="#C8B8A8" fillOpacity="0.05" />
              <path d="M 270 20 C 250 45, 255 110, 270 190" stroke="currentColor" strokeWidth="1.4" opacity="0.5" fill="#C8B8A8" fillOpacity="0.05" />
              <path d="M 155 160 H 245 Q 255 160 255 170 V 185 Q 255 190 250 190 H 150 Q 145 190 145 185 V 170 Q 145 160 155 160 Z" fill="#141A17" stroke="currentColor" strokeWidth="1.6" />
              <line x1="155" y1="172" x2="245" y2="172" stroke="currentColor" strokeWidth="1" opacity="0.6" />
              <line x1="155" y1="190" x2="152" y2="202" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="245" y1="190" x2="248" y2="202" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M 80 175 L 76 200 H 94 L 90 175 Z" fill="currentColor" opacity="0.8" />
              <path d="M 85 175 Q 78 145 68 115" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 85 175 Q 94 148 102 125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <ellipse cx="68" cy="115" rx="4.5" ry="8" transform="rotate(-30 68 115)" fill="currentColor" opacity="0.9" />
              <ellipse cx="76" cy="132" rx="4" ry="7" transform="rotate(-15 76 132)" fill="currentColor" opacity="0.9" />
              <ellipse cx="102" cy="125" rx="4.5" ry="8" transform="rotate(30 102 125)" fill="currentColor" opacity="0.9" />
              <ellipse cx="94" cy="140" rx="4" ry="7" transform="rotate(15 94 140)" fill="currentColor" opacity="0.9" />
              <ellipse cx="305" cy="175" rx="18" ry="5" fill="currentColor" opacity="0.35" />
              <line x1="305" y1="175" x2="305" y2="202" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="298" cy="170" r="5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="303" y1="170" x2="315" y2="170" stroke="currentColor" strokeWidth="1.4" />
              <line x1="310" y1="170" x2="310" y2="173" stroke="currentColor" strokeWidth="1.4" />
              <path d="M 320 65 L 322 70 L 327 72 L 322 74 L 320 79 L 318 74 L 313 72 L 318 70 Z" fill="#FFF4E5" opacity="0.85" />
              <path d="M 75 55 L 76 58 L 79 59 L 76 60 L 75 63 L 74 60 L 71 59 L 74 58 Z" fill="#C8B8A8" opacity="0.75" />
            </svg>
          </div>

          <div className="relative z-10 pt-2 border-t border-[#2A312C]/60 flex items-center justify-between shrink-0">
            <span className="text-[10px] sm:text-[11px] font-serif italic text-[#C8B8A8]">
              “Vận hành tinh gọn. Trải nghiệm có gu.”
            </span>
            <div className="flex items-center gap-1 text-[11px] text-[#E6D7C3]/80 font-serif italic tracking-wide">
              <span>Vkacabaca</span>
              <span className="text-[9px] text-[#C8B8A8]">✨</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Form */}
        <div className="md:col-span-5 p-5 sm:p-7 lg:p-8 flex flex-col justify-center bg-white relative h-full overflow-y-auto custom-scrollbar login-right-panel">
          <div className="w-full max-w-[320px] sm:max-w-[340px] mx-auto space-y-3.5 sm:space-y-4">

            <div>
              <div className="w-9 h-9 rounded-2xl bg-[#EBF0ED] border border-[#D1E3D5] text-[#3F594F] flex items-center justify-center mb-3 md:hidden">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#252724] tracking-tight">Đăng nhập</h3>
              <p className="text-[11px] text-[#73766F] mt-1 leading-relaxed">
                Nhập số điện thoại và mật khẩu để tiếp tục.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {error && (
                <div className="p-2.5 text-xs font-medium text-[#A84646] bg-[#FDF0F0] border border-[#F5D5D5] rounded-2xl animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#252724] block">Số điện thoại</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="VD: 0987654321"
                  className="w-full h-[42px] sm:h-[45px] px-3.5 bg-white border border-[#E8E5DF] rounded-2xl text-xs text-[#252724] placeholder:text-[#A3A69F] focus:outline-none focus:border-[#3F594F] focus:ring-4 focus:ring-[#3F594F]/10 transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-[#252724] block">Mật khẩu</label>
                  <span className="text-[10px] text-[#73766F] hover:text-[#3F594F] cursor-pointer font-medium transition-colors">
                    Quên mật khẩu?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full h-[42px] sm:h-[45px] pl-3.5 pr-10 bg-white border border-[#E8E5DF] rounded-2xl text-xs text-[#252724] placeholder:text-[#A3A69F] focus:outline-none focus:border-[#3F594F] focus:ring-4 focus:ring-[#3F594F]/10 transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73766F] hover:text-[#252724] transition-colors p-1 cursor-pointer"
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-full h-[44px] sm:h-[46px] text-xs font-semibold rounded-2xl bg-gradient-to-r from-[#3F594F] to-[#344B42] hover:from-[#344B42] hover:to-[#2B3E37] text-white shadow-[0_6px_20px_rgba(63,89,79,0.25)] hover:shadow-[0_8px_24px_rgba(63,89,79,0.35)] transition-all mt-2 cursor-pointer"
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </Button>
            </form>

            <div className="pt-3 text-center border-t border-[#F2EFE9]">
              <p className="text-[10px] text-[#A3A69F]">
                Nha Tro Manager • Boutique Property Platform © 2026
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
