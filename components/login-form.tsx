"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { ApiError } from "@/services/apiClient";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Lock, User } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      await login(username, password);
      router.replace(ROUTES.DASHBOARD);
    } catch (err) {
      console.error(err);
      if (err instanceof ApiError && err.detail) {
        setError(err.detail);
      } else if (err instanceof Error && err.message) {
        setError(err.message);
      } else {
        setError("Unable to sign in. Please check your credentials.");
      }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn("w-full max-w-sm", className)}
    >
      <form
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        {...(props as any)}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2"
          >
            <Lock className="size-7" />
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-extrabold tracking-tight"
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground text-sm"
          >
            Enter your credentials to access the HR portal
          </motion.p>
        </div>

        <motion.div variants={itemVariants} className="space-y-5">
          <FieldGroup className="gap-5">
            <Field className="space-y-2">
              <FieldLabel htmlFor="username" className="text-xs uppercase tracking-wider font-semibold opacity-70">
                Username
              </FieldLabel>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <User className="size-4" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 hover:bg-muted"
                />
              </div>
            </Field>

            <Field className="space-y-2">
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password" className="text-xs uppercase tracking-wider font-semibold opacity-70">
                  Password
                </FieldLabel>
                <a
                  href="#"
                  className="text-xs font-medium text-primary hover:underline underline-offset-4"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Lock className="size-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 hover:bg-muted"
                />
              </div>
            </Field>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 text-xs text-destructive p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 text-sm font-bold shadow-lg shadow-primary/20"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="size-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Authenticating...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </motion.div>
          </FieldGroup>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            Trusted by modern HR teams worldwide.
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}
