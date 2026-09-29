import { TrustLogoForm } from "../TrustLogoForm";
import { createTrustLogo } from "../actions";

export default function NewTrustLogoPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มโลโก้ลูกค้า</h1>
      <div className="mt-6">
        <TrustLogoForm action={createTrustLogo} submitLabel="สร้าง" />
      </div>
    </div>
  );
}
