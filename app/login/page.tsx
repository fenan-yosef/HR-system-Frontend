"use client";

import { GalleryVerticalEnd, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh bg-background overflow-hidden">
      {/* Left Column: Form Section */}
      <div className="relative z-10 flex w-full flex-col bg-background/80 p-6 backdrop-blur-sm md:p-12 lg:w-1/2 lg:bg-background">
        <div className="mb-12 flex items-center gap-3">
          <motion.div
            initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
          >
            <GalleryVerticalEnd className="size-6" />
          </motion.div>

          <motion.span
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl font-bold tracking-tight"
          >
            HR<span className="text-primary/70">Flow</span>
          </motion.span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <LoginForm />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 flex items-center justify-between text-xs text-muted-foreground"
        >
          <p>© 2026 HR-System Inc.</p>
          <div className="flex gap-4">
            <a href="#" className="transition-colors hover:text-primary">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-primary">
              Terms
            </a>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Animated Visual Section */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-white/5 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -70, 0],
            y: [0, 80, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] h-[70%] w-[70%] rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative z-20 max-w-md p-8 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="mb-6 text-4xl font-bold leading-tight">
              Empower your workforce with intelligence.
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-primary-foreground/80">
              Experience the next generation of Human Resource Management.
              Efficiency, transparency, and growth in one platform.
            </p>
          </motion.div>

          <div className="grid gap-6">
            {[
              { icon: LayoutDashboard, title: "Smart Dashboards", desc: "Real-time insights into team performance." },
              { icon: Users, title: "Talent Management", desc: "Seamless recruitment and onboarding flow." },
              { icon: ShieldCheck, title: "Secure & Compliant", desc: "Enterprise-grade security for your data." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
              >
                <div className="rounded-lg bg-white/10 p-2">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/60">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-10 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>
    </div>
  );
}