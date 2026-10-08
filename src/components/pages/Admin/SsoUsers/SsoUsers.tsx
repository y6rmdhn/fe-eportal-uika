import AdminLayout from "@/components/layouts/AdminLayout";
import environment from "@/config/environment";
import {
    AlertCircle,
    BookOpen,
    Check,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Copy,
    Globe,
    Key,
    Loader2,
    Play,
    Shield,
    Users,
    XCircle,
    Zap,
} from "lucide-react";
import { useState } from "react";

const SSO_ENDPOINT = `${environment.API_URL}/sso/users-sync`;
const PAGE_SIZE = 10;

const FIELDS = [
    { key: "user_id",      type: "string (UUID)",   desc: "ID unik user di E-Portal. Gunakan sebagai primary key di sub-aplikasi.", badge: "Wajib" },
    { key: "nama_lengkap", type: "string | null",   desc: "Nama lengkap user. Bisa null jika data pribadi belum diisi.", badge: "Opsional" },
    { key: "email",        type: "string",          desc: "Email user, bersifat unik di seluruh sistem.", badge: "Wajib" },
    { key: "username",     type: "string",          desc: "NPM (mahasiswa), NIDN (dosen), atau email sebagai fallback.", badge: "Wajib" },
    { key: "password",     type: "string (Bcrypt)", desc: "Password hashed. Verifikasi login via /sso/introspect, bukan lokal.", badge: "Hashed" },
    { key: "role",         type: "string",          desc: "Role user: admin, Mahasiswa, Dosen, Staff Akademik, dll.", badge: "Wajib" },
    { key: "jabatan",      type: "string[]",        desc: "Daftar jabatan user dalam ekosistem E-Portal.", badge: "Array" },
    { key: "is_verified",  type: "boolean",         desc: "Status verifikasi akun. false = belum aktif, tidak boleh login.", badge: "Wajib" },
    { key: "created_at",   type: "datetime (ISO)",  desc: "Waktu akun dibuat, format ISO 8601.", badge: "Wajib" },
];

const BADGE_COLOR: Record<string, string> = {
    "Wajib":    "bg-emerald-100 text-emerald-700",
    "Opsional": "bg-gray-100 text-gray-600",
    "Hashed":   "bg-orange-100 text-orange-700",
    "Array":    "bg-purple-100 text-purple-700",
};

const INTEGRATION_STEPS = [
    {
        title: "Hit Endpoint API",
        desc: "Panggil GET endpoint. Tidak butuh token atau header khusus.",
        code: `GET ${environment.API_URL}/sso/users-sync`,
    },
    {
        title: "Simpan / Sync Data User",
        desc: "Iterasi array 'data', simpan ke DB sub-aplikasi dengan upsert berdasarkan user_id.",
        code: `const res = await axios.get('/api/sso/users-sync');
for (const user of res.data.data) {
  await db.upsert('users', user, { on: 'user_id' });
}`,
    },
    {
        title: "Verifikasi Login via SSO Introspect",
        desc: "Jangan verifikasi password lokal. Arahkan ke E-Portal SSO.",
        code: `POST ${environment.API_URL}/sso/introspect
Headers: X-Client-ID, X-Client-Secret
Body:    { "token": "sso_token_from_eportal" }`,
    },
];

const JSON_EXAMPLE = `{
  "status": 200,
  "message": "SSO Users retrieved successfully.",
  "data": [
    {
      "user_id": "f66b0c10-4957-489b-9426-7ac57c070e3f",
      "nama_lengkap": "Budi Santoso",
      "email": "budi@uika.ac.id",
      "username": "0011223344",
      "password": "$2y$10$hashedpassword...",
      "role": "Mahasiswa",
      "jabatan": ["mahasiswa"],
      "is_verified": true,
      "created_at": "2024-01-01T10:00:00.000000Z"
    }
  ]
}`;

function roleBadge(role: string) {
    const r = (role || "").toLowerCase();
    if (r === "admin") return "bg-red-100 text-red-700";
    if (r.includes("mahasiswa")) return "bg-blue-100 text-blue-700";
    if (r.includes("dosen")) return "bg-purple-100 text-purple-700";
    if (r.includes("staff") || r.includes("akademik")) return "bg-amber-100 text-amber-700";
    return "bg-gray-100 text-gray-600";
}

function JsonBlock({ json }: { json: string }) {
    return (
        <pre className="text-xs font-mono leading-relaxed overflow-x-auto text-emerald-300">
            {json}
        </pre>
    );
}

function PaginatedTable({ users }: { users: any[] }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return (
            (u.nama_lengkap || "").toLowerCase().includes(q) ||
            (u.username || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.role || "").toLowerCase().includes(q)
        );
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const pages: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== "...") pages.push("...");
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Cari nama, username, email, atau role..."
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50"
                />
                <span className="text-xs text-gray-400 shrink-0 font-medium">{filtered.length} user</span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            {["#", "Nama Lengkap", "Username", "Email", "Role", "Status"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Tidak ada data yang cocok.</td></tr>
                        ) : paginated.map((u, i) => (
                            <tr key={u.user_id} className={`border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                                <td className="px-4 py-3 text-xs text-gray-400">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                <td className="px-4 py-3 font-medium text-gray-800 text-sm">{u.nama_lengkap || <span className="text-gray-400 italic text-xs">Belum diisi</span>}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{(u.username || "").trim() || "-"}</td>
                                <td className="px-4 py-3 text-xs text-gray-600">{u.email || "-"}</td>
                                <td className="px-4 py-3">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>{u.role || "-"}</span>
                                </td>
                                <td className="px-4 py-3">
                                    {u.is_verified
                                        ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><CheckCircle size={12} />Verified</span>
                                        : <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold"><XCircle size={12} />Belum</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Halaman {page} dari {totalPages}</p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                            Prev
                        </button>
                        {pages.map((p, idx) =>
                            p === "..." ? (
                                <span key={`d${idx}`} className="px-2 text-gray-400 text-xs">...</span>
                            ) : (
                                <button key={p} onClick={() => setPage(p as number)}
                                    className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === p ? "bg-emerald-600 text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-600"}`}>
                                    {p}
                                </button>
                            )
                        )}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function TryItOut() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<null | { status: number; time: number; data: any }>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const execute = async () => {
        setLoading(true);
        setResult(null);
        setError(null);
        const start = performance.now();
        try {
            const res = await fetch(SSO_ENDPOINT);
            const time = Math.round(performance.now() - start);
            const data = await res.json();
            setResult({ status: res.status, time, data });
        } catch (e: any) {
            setError(e.message || "Gagal menghubungi server.");
        } finally {
            setLoading(false);
        }
    };

    const rawJson = result ? JSON.stringify(result.data, null, 2) : "";

    const handleCopy = () => {
        navigator.clipboard.writeText(rawJson);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-gray-950 rounded-2xl px-5 py-4">
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold shrink-0">GET</span>
                <span className="text-emerald-300 text-xs font-mono flex-1 truncate">{SSO_ENDPOINT}</span>
                <button
                    onClick={execute}
                    disabled={loading}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                    {loading ? "Loading..." : "Execute"}
                </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={13} className="text-emerald-500" />
                <span>Endpoint ini <strong>tidak memerlukan autentikasi</strong> — langsung bisa dipanggil.</span>
            </div>

            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    <XCircle size={16} /> {error}
                </div>
            )}

            {result && (
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between bg-gray-50 px-5 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${result.status === 200 ? "bg-emerald-500" : "bg-red-500"}`} />
                                <span className={`text-sm font-bold ${result.status === 200 ? "text-emerald-700" : "text-red-700"}`}>
                                    {result.status} {result.status === 200 ? "OK" : "Error"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock size={12} />{result.time} ms
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Zap size={12} />
                                {Array.isArray(result.data?.data) ? `${result.data.data.length} user` : "—"}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowRaw(!showRaw)}
                                className="text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                                {showRaw ? "Pretty" : "Raw"}
                            </button>
                            <button onClick={handleCopy}
                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold">
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? "Tersalin!" : "Copy JSON"}
                            </button>
                        </div>
                    </div>
                    <div className="bg-gray-950 p-5 max-h-80 overflow-y-auto">
                        <JsonBlock json={showRaw ? rawJson : rawJson} />
                    </div>
                    {result.status === 200 && Array.isArray(result.data?.data) && result.data.data.length > 0 && (
                        <div className="p-5 border-t border-gray-100 bg-white">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Preview Tabel Data</p>
                            <PaginatedTable users={result.data.data} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SsoUsers() {
    const [copied, setCopied] = useState(false);
    const [copiedStep, setCopiedStep] = useState<number | null>(null);
    const [showFields, setShowFields] = useState(true);

    const handleCopy = (text: string, idx?: number) => {
        navigator.clipboard.writeText(text);
        if (idx !== undefined) {
            setCopiedStep(idx);
            setTimeout(() => setCopiedStep(null), 2000);
        } else {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AdminLayout title="SSO Users | E-Portal UIKA" desc="Dokumentasi & API Explorer SSO Users">
            <div className="flex flex-col gap-6 p-6 max-w-[1100px] mx-auto">

                <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <Users className="text-emerald-600" size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">SSO Users — API Documentation</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Endpoint untuk sinkronisasi data user E-Portal ke sub-aplikasi. Klik <strong>Execute</strong> untuk mencoba langsung.
                        </p>
                    </div>
                </div>

                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <AlertCircle className="text-blue-500 mt-0.5 shrink-0" size={18} />
                    <p className="text-sm text-blue-800">
                        Endpoint <code className="bg-blue-100 px-1 rounded text-xs">/api/sso/users-sync</code> bersifat <strong>publik</strong> — tidak perlu token.
                        Password selalu dikembalikan dalam format <strong>Bcrypt hash</strong>.
                    </p>
                </div>

                {/* Try It Out */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <Zap className="text-emerald-500 shrink-0" size={20} />
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Try It Out</h2>
                            <p className="text-xs text-gray-500">Klik Execute untuk hit endpoint langsung dan lihat response aslinya</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <TryItOut />
                    </div>
                </div>

                {/* Endpoint & Example */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center gap-3">
                        <Globe className="text-emerald-600 shrink-0" size={20} />
                        <div>
                            <h2 className="text-base font-bold text-emerald-800">Endpoint & Contoh Response</h2>
                            <p className="text-xs text-emerald-600">URL dan format JSON yang dikembalikan API</p>
                        </div>
                    </div>
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Request URL</p>
                                <div className="flex items-center gap-2 bg-gray-950 rounded-xl px-4 py-3 overflow-x-auto">
                                    <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md text-xs font-bold shrink-0">GET</span>
                                    <span className="text-emerald-300 text-xs font-mono">{SSO_ENDPOINT}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Persyaratan</p>
                                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 border border-gray-100">
                                    {[
                                        { ok: true, text: "Tidak memerlukan header khusus" },
                                        { ok: true, text: "Tidak memerlukan token JWT / API Key" },
                                        { ok: false, text: "Jangan simpan plain-text password" },
                                    ].map(({ ok, text }, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                            {ok ? <CheckCircle size={13} className="text-emerald-500" /> : <XCircle size={13} className="text-orange-400" />}
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Contoh Response JSON</p>
                                <button onClick={() => handleCopy(JSON_EXAMPLE)}
                                    className="flex items-center gap-1 text-xs text-emerald-600 font-bold hover:text-emerald-700">
                                    {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Tersalin!" : "Copy"}
                                </button>
                            </div>
                            <div className="bg-gray-950 rounded-xl p-4 overflow-x-auto max-h-64">
                                <JsonBlock json={JSON_EXAMPLE} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Field Descriptions */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <button className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        onClick={() => setShowFields(!showFields)}>
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-indigo-500 shrink-0" size={20} />
                            <div className="text-left">
                                <h2 className="text-base font-bold text-gray-900">Deskripsi Field Response</h2>
                                <p className="text-xs text-gray-500">Klik untuk melihat/menyembunyikan penjelasan tiap field</p>
                            </div>
                        </div>
                        {showFields ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </button>
                    {showFields && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        {["Field", "Tipe Data", "Status", "Keterangan"].map(h => (
                                            <th key={h} className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {FIELDS.map((f, i) => (
                                        <tr key={f.key} className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                                            <td className="px-6 py-3 font-mono text-xs text-emerald-700 font-bold">{f.key}</td>
                                            <td className="px-6 py-3 font-mono text-xs text-gray-500">{f.type}</td>
                                            <td className="px-6 py-3">
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_COLOR[f.badge]}`}>{f.badge}</span>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-gray-600">{f.desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Integration Guide */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                        <Key className="text-amber-500 shrink-0" size={20} />
                        <div>
                            <h2 className="text-base font-bold text-gray-900">Panduan Integrasi Sub-Aplikasi</h2>
                            <p className="text-xs text-gray-500">Langkah yang perlu dilakukan developer sub-aplikasi</p>
                        </div>
                    </div>
                    <div className="p-6 flex flex-col gap-5">
                        {INTEGRATION_STEPS.map((step, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-sm">{step.title}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{step.desc}</p>
                                    <div className="relative">
                                        <pre className="bg-gray-950 text-emerald-300 text-xs font-mono rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre">{step.code}</pre>
                                        <button onClick={() => handleCopy(step.code, idx)}
                                            className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white p-1 rounded-lg transition-colors">
                                            {copiedStep === idx ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Warning */}
                <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4">
                    <Shield className="text-orange-500 mt-0.5 shrink-0" size={18} />
                    <div>
                        <p className="text-sm font-bold text-orange-800">Catatan Keamanan</p>
                        <p className="text-xs text-orange-700 mt-1">
                            Password selalu di-hash <strong>Bcrypt</strong>. Sub-aplikasi <strong>DILARANG</strong> menyimpan plain-text.
                            Verifikasi login selalu via <code className="bg-orange-100 px-1 rounded">POST /api/sso/introspect</code>.
                        </p>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
