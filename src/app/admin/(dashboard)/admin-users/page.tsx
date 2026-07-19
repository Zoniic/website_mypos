import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/adminAuth";

export default async function AdminUsersPage() {
  const [users, session] = await Promise.all([
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    getSessionUser(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Users</h1>
        <Link
          href="/admin/admin-users/new"
          className="rounded-button bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New User
        </Link>
      </div>
      <p className="mt-1 text-text-2">People who can sign in to this admin panel.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Last login</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium">
                  {user.name}
                  {session?.userId === user.id && (
                    <span className="ml-2 rounded-tag bg-surface-2 px-2 py-0.5 text-xs text-text-2">
                      You
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-text-2">{user.email}</td>
                <td className="px-4 py-3 text-text-2">
                  {user.lastLoginAt ? user.lastLoginAt.toLocaleString() : "Never"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/admin-users/${user.id}/edit`}
                    className="text-primary-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
