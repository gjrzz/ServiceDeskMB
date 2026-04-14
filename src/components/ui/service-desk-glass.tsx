import React from "react";
import { GlassEffect, GlassButton, GlassFilter } from "./liquid-glass";
import { Ticket, User, BarChart2, Settings, Bell, Search } from "lucide-react";

interface ServiceDeskGlassProps {
  onNavigate?: (section: string) => void;
}

export const ServiceDeskGlass: React.FC<ServiceDeskGlassProps> = ({ onNavigate }) => {
  const quickActions = [
    { icon: Ticket, label: "Novo Chamado", action: "new-ticket" },
    { icon: User, label: "Meus Chamados", action: "my-tickets" },
    { icon: BarChart2, label: "Dashboard", action: "dashboard" },
    { icon: Settings, label: "Configurações", action: "settings" },
    { icon: Bell, label: "Notificações", action: "notifications" },
    { icon: Search, label: "Buscar", action: "search" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <GlassFilter />
      <div className="flex flex-col gap-6 items-center justify-center">
        {/* Quick Actions Dock */}
        <GlassEffect className="rounded-3xl p-4">
          <div className="flex items-center justify-center gap-3 p-2">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div
                  key={index}
                  className="glass-button flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300 cursor-pointer group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(6px)',
                  }}
                  onClick={() => onNavigate?.(action.action)}
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">
                    {action.label}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassEffect>

        {/* Main Action Button */}
        <GlassButton>
          <div className="text-lg text-white font-medium">
            <p>Como posso ajudar você hoje?</p>
          </div>
        </GlassButton>
      </div>
    </div>
  );
};