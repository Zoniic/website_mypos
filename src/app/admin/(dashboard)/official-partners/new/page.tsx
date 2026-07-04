import { PartnerForm } from "../PartnerForm";
import { createOfficialPartner } from "../actions";

export default function NewOfficialPartnerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Official Partner</h1>
      <div className="mt-6">
        <PartnerForm action={createOfficialPartner} submitLabel="Create" />
      </div>
    </div>
  );
}
