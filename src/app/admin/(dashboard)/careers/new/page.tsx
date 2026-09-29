import { JobPostingForm } from "../JobPostingForm";
import { createJobPosting } from "../actions";

export default function NewJobPostingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มตำแหน่งงาน</h1>
      <div className="mt-6">
        <JobPostingForm action={createJobPosting} submitLabel="สร้างตำแหน่งงาน" />
      </div>
    </div>
  );
}
