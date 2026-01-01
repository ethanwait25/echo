import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  register as registerUser,
  login as loginUser,
} from "@/service/authService";
import { Eye, EyeOff, Lock, Sparkles, LineChart } from "lucide-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <Card className="w-full overflow-hidden shadow-sm p-0 md:h-[620px]">
          <div className="grid h-full grid-cols-1 md:grid-cols-2">
            <BrandPanel />
            <div className="flex h-full min-h-0 flex-col p-8 md:p-10">
              <Tabs
                defaultValue="login"
                className="flex min-h-0 flex-1 flex-col"
              >
                {/* Fixed header */}
                <div className="pb-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Log in</TabsTrigger>
                    <TabsTrigger value="register">Create account</TabsTrigger>
                  </TabsList>
                </div>

                {/* Flexible content */}
                <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto">
                  <div className="w-full max-w-md">
                    <TabsContent value="login">
                      <LoginForm />
                    </TabsContent>

                    <TabsContent value="register">
                      <RegisterForm />
                    </TabsContent>
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <div className="relative hidden h-full w-full md:flex overflow-hidden rounded-none">
      {/* Full bleed background */}
      <div className="absolute inset-0 bg-muted/40" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/70 to-muted" />

      <div className="relative flex h-full w-full flex-col items-center justify-center px-12 text-center">
        <img src="/echo.png" alt="echo" className="h-20 w-auto select-none" />

        <p className="mt-6 max-w-xs text-sm text-muted-foreground">
          It’s all coming back to you.
        </p>

        {/* subtle filler content */}
        <div className="mt-10 w-full max-w-xs space-y-3 text-left text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4" />
            <span>Calm, fast daily writing</span>
          </div>
          <div className="flex items-center gap-3">
            <LineChart className="h-4 w-4" />
            <span>Recognize trends in your experiences</span>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4" />
            <span>Secure your memories</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-4">
      <div className="text-sm font-medium">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => email.trim() && password.length >= 8,
    [email, password]
  );

  return (
    <>
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Log in to continue your journal.</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setIsSubmitting(true);

            try {
              await loginUser(email, password);
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Login failed";
              setError(message);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <button
                type="button"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                onClick={() => console.log("TODO: forgot password flow")}
              >
                Forgot?
              </button>
            </div>

            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              At least 8 characters.
            </p>
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="relative py-2">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
              OR
            </span>
          </div>

          <Button
            className="w-full"
            type="button"
            variant="secondary"
            onClick={() => console.log("TODO: OAuth")}
          >
            Continue with Google
          </Button>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            By continuing, you agree to the Terms and Privacy Policy.
          </p>
        </form>
      </CardContent>
    </>
  );
}

function RegisterForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim().length >= 1 &&
      lastName.trim().length >= 1 &&
      username.trim().length >= 3 &&
      email.trim().length > 3 &&
      password.length >= 8 &&
      password === confirm
    );
  }, [firstName, lastName, username, email, password, confirm]);

  return (
    <>
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start journaling in under a minute.</CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setIsSubmitting(true);

            try {
              await registerUser({
                email,
                password,
                firstName,
                lastName,
                displayName: username,
              });
            } catch (err) {
              const message =
                err instanceof Error ? err.message : "Registration failed";
              setError(message);
            } finally {
              setIsSubmitting(false);
            }
          }}
        >
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reg-first-name">First name</Label>
              <Input
                id="reg-first-name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reg-last-name">Last name</Label>
              <Input
                id="reg-last-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="reg-username">Username</Label>
            <Input
              id="reg-username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@domain.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showRegPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowRegPassword((v) => !v)}
                aria-label={showRegPassword ? "Hide password" : "Show password"}
                aria-pressed={showRegPassword}
              >
                {showRegPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Use 8+ characters.</p>
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="reg-confirm">Confirm password</Label>
            <div className="relative">
              <Input
                id="reg-confirm"
                type={showRegConfirm ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setShowRegConfirm((v) => !v)}
                aria-label={showRegConfirm ? "Hide password" : "Show password"}
                aria-pressed={showRegConfirm}
              >
                {showRegConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {confirm.length > 0 && confirm !== password && (
              <p className="text-xs text-destructive">
                Passwords do not match.
              </p>
            )}
          </div>

          <Button
            className="w-full"
            type="submit"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </CardContent>
    </>
  );
}
