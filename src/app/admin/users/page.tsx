"use client";

import { useEffect, useState } from "react";

interface UserData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  _count: { reservations: number; wishlist: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/admin/users?search=${encodeURIComponent(q)}` : "/api/admin/users";
    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const changeRole = async (id: string, role: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menaxhimi i Perdoruesve</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kerko me emer ose email..."
            className="flex-1 max-w-md border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Kerko
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); fetchUsers(); }}
              className="text-gray-500 px-3 py-2 text-sm hover:text-gray-700"
            >
              Pastro
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Duke ngarkuar...</div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">Nuk u gjeten perdorues.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Perdoruesi</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Roli</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Rezervime</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Wishlist</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Krijuar me</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Veprime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{u.name?.[0]?.toUpperCase() || "?"}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name || "—"}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer ${
                          u.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{u._count.reservations}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">{u._count.wishlist}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("sq-AL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/admin/users/${u.id}`}
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        Shiko
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
            {users.length} perdorues total
          </div>
        </div>
      )}
    </div>
  );
}
