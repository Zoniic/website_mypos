import { BlogPostForm } from "../BlogPostForm";
import { createBlogPost } from "../actions";

export default function NewBlogPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">เขียนบทความใหม่</h1>
      <div className="mt-6">
        <BlogPostForm action={createBlogPost} submitLabel="เผยแพร่บทความ" />
      </div>
    </div>
  );
}
