import { AuthScreen } from "@/components/auth-screen";
import { AuthRedirectGate } from "@/components/auth-redirect-gate";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  return (
    <AuthScreen mode="signup">
      <AuthRedirectGate />
      <SignupForm initialError={searchParams?.error ? decodeURIComponent(searchParams.error) : null} />
    </AuthScreen>
  );
}
