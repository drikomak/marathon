"use client";

import { BellIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import ClientOnly from "../ClientOnly";
import { ThemeToggle } from "../ThemeToggle";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <ClientOnly>
      <header className={cn(
        "sticky top-0 z-10 transition-all duration-300",
        isScrolled ? "glass-effect" : "bg-background"
      )}>
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-[2px] bg-primary rounded-full" />
              <h1 className="text-xl font-medium">
                <span className="font-serif font-bold text-primary">Museum</span>
                <span className="ml-1 text-muted-foreground">AI</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative btn-hover-effect"
                >
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground animate-in zoom-in">
                    3
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notifications</DialogTitle>
                  <DialogDescription>Your recent system notifications</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium">Learning progress update</p>
                    <p className="text-xs text-muted-foreground">Model accuracy has reached 85%</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-primary">
                      <span className="h-1 w-1 rounded-full bg-primary"></span>
                      <span>Just now</span>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium">New artworks added</p>
                    <p className="text-xs text-muted-foreground">12 new artworks have been added to the dataset</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                      <span>2 hours ago</span>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium">Classification completed</p>
                    <p className="text-xs text-muted-foreground">Batch #3 classification has been completed</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground"></span>
                      <span>5 hours ago</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <ThemeToggle />
            
            <div className="h-6 w-[1px] bg-border"></div>
            
            <Button variant="ghost" className="gap-2 btn-hover-effect">
              <span className="hidden md:inline-flex font-medium">Admin</span>
              <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-primary/20">
                <img
                  className="aspect-square h-full w-full object-cover"
                  src="https://randomuser.me/api/portraits/women/42.jpg"
                  alt="User avatar"
                />
              </span>
            </Button>
          </div>
        </div>
      </header>
    </ClientOnly>
  );
} 