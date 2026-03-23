import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Briefcase, ArrowRight } from "lucide-react";
import { useLogin } from "@/hooks/use-auth";
import { Input, Button, Label } from "@/components/ui";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const login = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
      toast.success("Welcome back!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24 border-r">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 text-primary font-display font-bold text-2xl mb-8">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Briefcase size={22} />
              </div>
              Opportunity Hub
            </div>
            
            <h2 className="text-3xl font-display font-bold tracking-tight text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                Sign up today
              </Link>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-10"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full text-base h-12 mt-2 gap-2" disabled={login.isPending}>
                {login.isPending ? "Signing in..." : "Sign in"}
                {!login.isPending && <ArrowRight size={18} />}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-1/2 overflow-hidden bg-card">
        {/* We use an abstract mesh gradient background here */}
        <img
          className="absolute inset-0 h-full w-full object-cover opacity-90"
          src={`${import.meta.env.BASE_URL}auth-bg.png`}
          alt="Abstract mesh gradient"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16 z-10 text-white">
          <motion.blockquote 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="space-y-4"
          >
            <p className="text-3xl font-display font-medium leading-tight text-white drop-shadow-md">
              "Opportunity Hub has completely transformed how I find clients. 
              The matching algorithm is incredibly accurate."
            </p>
            <footer className="flex flex-col drop-shadow-md">
              <span className="font-semibold text-lg text-white">Alex Rivera</span>
              <span className="text-white/80">Senior Full-Stack Developer</span>
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </div>
  );
}
