import { Building2, Bell, Shield, Users, Palette } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your HRMS configuration</p>
      </div>

      {[
        {
          icon: Building2,
          title: "Company Profile",
          desc: "Update company name, logo, and contact details",
        },
        {
          icon: Users,
          title: "Team & Roles",
          desc: "Manage HR admins, managers, and access permissions",
        },
        {
          icon: Bell,
          title: "Notification Preferences",
          desc: "Configure email and in-app notification settings",
        },
        {
          icon: Shield,
          title: "Security",
          desc: "Password policy, 2FA, and session management",
        },
        {
          icon: Palette,
          title: "Appearance",
          desc: "Theme, color, and display preferences",
        },
      ].map(({ icon: Icon, title, desc }) => (
        <div key={title} className="stat-card flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-transform">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(var(--primary-light))", color: "hsl(var(--primary))" }}>
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
          </div>
          <div className="text-muted-foreground">›</div>
        </div>
      ))}
    </div>
  );
}
