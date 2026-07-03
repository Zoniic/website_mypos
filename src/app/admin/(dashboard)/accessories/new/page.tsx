import { AccessoryForm } from "../AccessoryForm";
import { createAccessory } from "../actions";

export default function NewAccessoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Accessory</h1>
      <div className="mt-6">
        <AccessoryForm action={createAccessory} submitLabel="Create Accessory" />
      </div>
    </div>
  );
}
