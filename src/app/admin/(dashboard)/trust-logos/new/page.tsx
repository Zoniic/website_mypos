import { TrustLogoForm } from "../TrustLogoForm";
import { createTrustLogo } from "../actions";

export default function NewTrustLogoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Trust Logo</h1>
      <div className="mt-6">
        <TrustLogoForm action={createTrustLogo} submitLabel="Create" />
      </div>
    </div>
  );
}
