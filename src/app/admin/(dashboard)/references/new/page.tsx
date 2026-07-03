import { ReferenceForm } from "../ReferenceForm";
import { createReference } from "../actions";

export default function NewReferencePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Case Study</h1>
      <div className="mt-6">
        <ReferenceForm action={createReference} submitLabel="Create Case Study" />
      </div>
    </div>
  );
}
