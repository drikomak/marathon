"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Home,
  ImageIcon,
  Layers,
  PieChart,
  Settings,
  HelpCircle,
  Database,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Questionnaire",
    href: "/questionnaire",
    icon: HelpCircle,
  },
  {
    title: "Learning Phase",
    href: "/learning",
    icon: ImageIcon,
  },
  {
    title: "Classification",
    href: "/classification",
    icon: Layers,
  },
  {
    title: "Progress Curve",
    href: "/progress",
    icon: BarChart3,
  },
  {
    title: "Statistics",
    href: "/statistics",
    icon: PieChart,
  },
  {
    title: "Dataset",
    href: "/dataset",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 px-6 py-4">
        <Palette className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-xl font-serif font-bold tracking-tight text-primary">
            Museum
          </h2>
          <p className="text-xs text-muted-foreground">Active Learning Interface</p>
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link group",
                isActive && "text-primary bg-primary/10"
              )}
              data-active={isActive}
            >
              <Icon 
                size={18} 
                className={cn(
                  "transition-transform group-hover:scale-110",
                  isActive && "text-primary"
                )}
              />
              <span className="text-sm font-medium">{item.title}</span>
              {isActive && (
                <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      <Separator className="mt-4" />

      <div className="p-4">
        <div className="rounded-lg bg-primary/5 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm font-medium">Current Session</p>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">742</span> artworks classified
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">85%</span> accuracy achieved
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 