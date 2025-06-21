import ResetVerifyPage from "@/components/PasswordReset";

export default function Page({
  params,
}: {
  params: { token: string }; // Directly destructure params
}) {
  const { token } = params; // Get the token

  return (
    <div>
      {/* Pass token as a prop to ResetVerifyPage */}
      <ResetVerifyPage token={token} />
    </div>
  );
}
