import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case "/": return "Dashboard";
      case "/accounts": return "Telegram Accounts";
      case "/keywords": return "Keywords & Filters";
      case "/settings": return "System Settings";
      case "/logs": return "Live Radar Logs";
      default: return "Radar System";
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-background/50 backdrop-blur-xl px-6 sticky top-0 z-10">
            <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
            <div className="h-4 w-px bg-border/50 hidden md:block" />
            <h1 className="text-xl font-semibold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {getPageTitle()}
            </h1>
          </header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 scroll-smooth z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mx-auto max-w-6xl space-y-6 pb-20"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
