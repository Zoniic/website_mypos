import { JobPostingForm } from "../JobPostingForm";
import { createJobPosting } from "../actions";

export default function NewJobPostingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">New Job Posting</h1>
      <div className="mt-6">
        <JobPostingForm action={createJobPosting} submitLabel="Create Job Posting" />
      </div>
    </div>
  );
}
