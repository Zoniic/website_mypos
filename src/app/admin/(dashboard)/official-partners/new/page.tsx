import { PartnerForm } from "../PartnerForm";
import { createOfficialPartner } from "../actions";

export default function NewOfficialPartnerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มพาร์ทเนอร์</h1>
      <div className="mt-6">
        <PartnerForm action={createOfficialPartner} submitLabel="สร้าง" />
      </div>
    </div>
  );
}
