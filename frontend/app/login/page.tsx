import { AuthScreen } from "@/components/auth-screen";
import { AuthRedirectGate } from "@/components/auth-redirect-gate";
import { LoginForm } from "@/components/login-form";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; redirect_uri?: string };
}) {
  return (
    <AuthScreen mode="login">
      <AuthRedirectGate />
      <LoginForm
        initialError={searchParams?.error ? decodeURIComponent(searchParams.error) : null}
        cliRedirectUri={searchParams?.redirect_uri ? decodeURIComponent(searchParams.redirect_uri) : null}
      />
    </AuthScreen>
  );
}
