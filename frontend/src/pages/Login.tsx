import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import atfalLogo from "/atfal-logo.png";
import { Shield, Users, BarChart3, GraduationCap, MapPin } from "lucide-react";

const features = [
  { icon: Users, text: "Complete member lifecycle management" },
  { icon: GraduationCap, text: "Automatic graduation tracking & alerts" },
  { icon: BarChart3, text: "National, regional & zonal analytics" },
  { icon: MapPin, text: "Full Ghana location hierarchy" },
  { icon: Shield, text: "Secure, role-based access control" },
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Signed in successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL — branding / ad ── */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[58%] relative flex-col justify-between overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(142,60%,12%) 0%, hsl(142,52%,18%) 50%, hsl(43,80%,28%) 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(43,90%,60%), transparent)" }} />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(circle, hsl(43,90%,60%), transparent)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, white, transparent)" }} />

        {/* Top brand mark */}
        <div className="relative z-10 p-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <img src={atfalLogo} alt="Majlis Atfal" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <p className="font-bold text-white text-sm tracking-tight">Majlis Atfal-ul-Ahmadiyya</p>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Ghana</p>
            </div>
          </div>
        </div>

        {/* Centre hero text */}
        <div className="relative z-10 px-10 py-8 flex-1 flex flex-col justify-center">
          <div className="space-y-6 max-w-sm">
            <div>
              <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight tracking-tight">
                National<br />
                <span style={{ color: "hsl(43,90%,60%)" }}>Management</span><br />
                System
              </h1>
              <p className="mt-4 text-white/60 text-sm leading-relaxed">
                The central platform for managing Atfal members across all sectors, regions, and zones in Ghana.
              </p>
            </div>

            <div className="space-y-3">
              {features.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <Icon className="h-3.5 w-3.5 text-white/70" />
                  </div>
                  <p className="text-white/65 text-xs leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 p-10">
          <div className="border-t border-white/10 pt-6">
            <p className="text-white/40 text-xs italic">
              "Nurturing the next generation of Ahmadi youth in Ghana."
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — login form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background px-6 sm:px-10">

        {/* Mobile-only logo */}
        <div className="lg:hidden mb-8 text-center">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md border mx-auto mb-3">
            <img src={atfalLogo} alt="Majlis Atfal" className="h-9 w-9 object-contain" />
          </div>
          <p className="font-bold text-lg tracking-tight">Majlis Atfal Ghana</p>
          <p className="text-xs text-muted-foreground">National Management System</p>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your admin account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={loading}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold mt-2"
              disabled={loading}
              style={{
                background: loading ? undefined : "hsl(142,60%,18%)",
                color: "white",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground/60">
            Majlis Atfal-ul-Ahmadiyya Ghana &mdash; Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
