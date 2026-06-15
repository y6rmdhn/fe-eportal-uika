// src/components/pages/Admin/SsoKeys.tsx
import AdminLayout from "@/components/layouts/AdminLayout";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Code2,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Search,
  Globe,
  Server,
  ChevronDown,
  ChevronUp,
  FileCode,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import useSsoTemplates from "@/hooks/SsoKey/useSsoTemplates";

const LANGUAGE_COLORS: Record<string, string> = {
  javascript: "bg-yellow-50 text-yellow-700 border-yellow-100",
  php: "bg-indigo-50 text-indigo-700 border-indigo-100",
  python: "bg-blue-50 text-blue-700 border-blue-100",
  java: "bg-orange-50 text-orange-700 border-orange-100",
  go: "bg-cyan-50 text-cyan-700 border-cyan-100",
};

const EMPTY_FORM = {
  name: "",
  category: "frontend",
  language: "javascript",
  icon: "",
  code_snippet: "",
  description: "",
  dependencies: "",
  order: 0,
  is_active: true,
};

const SsoKeys = () => {
  const {
    templates,
    isLoading,
    createTemplate,
    isCreating,
    updateTemplate,
    isUpdating,
    deleteTemplate,
    isDeleting,
  } = useSsoTemplates();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = useMemo(() => {
    return templates.filter((t: any) => {
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [templates, search, categoryFilter]);

  const frontend = filtered.filter((t: any) => t.category === "frontend");
  const backend = filtered.filter((t: any) => t.category === "backend");

  const handleCopy = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Kode berhasil disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenCreate = () => {
    setSelectedTemplate(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const handleOpenEdit = (template: any) => {
    setSelectedTemplate(template);
    setForm({
      name: template.name,
      category: template.category,
      language: template.language,
      icon: template.icon || "",
      code_snippet: template.code_snippet,
      description: template.description || "",
      dependencies: template.dependencies || "",
      order: template.order || 0,
      is_active: template.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.code_snippet) {
      toast.error("Nama dan kode snippet wajib diisi.");
      return;
    }

    if (selectedTemplate) {
      updateTemplate(
        { id: selectedTemplate.id, payload: form },
        {
          onSuccess: () => setDialogOpen(false),
        },
      );
    } else {
      createTemplate(form, {
        onSuccess: () => setDialogOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (!selectedTemplate) return;
    deleteTemplate(selectedTemplate.id, {
      onSuccess: () => setDeleteDialogOpen(false),
    });
  };

  const TemplateCard = ({ template }: { template: any }) => {
    const isExpanded = expandedId === template.id;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Card Header */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <FileCode size={18} className="text-emerald-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-gray-900 text-[15px] truncate">
                  {template.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${LANGUAGE_COLORS[template.language] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}
                  >
                    {template.language}
                  </span>
                  {!template.is_active && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                      Nonaktif
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                onClick={() => handleCopy(template.code_snippet, template.id)}
              >
                {copiedId === template.id ? (
                  <Check size={15} />
                ) : (
                  <Copy size={15} />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg"
                onClick={() => handleOpenEdit(template)}
              >
                <Edit2 size={15} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg"
                onClick={() => {
                  setSelectedTemplate(template);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>

          {template.description && (
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              {template.description}
            </p>
          )}

          {template.dependencies && (
            <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Dependencies
              </p>
              <code className="text-xs text-emerald-700 font-mono">
                {template.dependencies}
              </code>
            </div>
          )}
        </div>

        {/* Code Snippet Toggle */}
        <div className="border-t border-gray-50">
          <button
            className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
            onClick={() => setExpandedId(isExpanded ? null : template.id)}
          >
            <span>Lihat Kode Snippet</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isExpanded && (
            <div className="relative">
              <pre className="p-5 bg-gray-950 text-gray-100 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed">
                <code>{template.code_snippet}</code>
              </pre>
              <Button
                size="sm"
                className="absolute top-3 right-3 h-7 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/10"
                onClick={() => handleCopy(template.code_snippet, template.id)}
              >
                {copiedId === template.id ? (
                  <Check size={12} className="mr-1" />
                ) : (
                  <Copy size={12} className="mr-1" />
                )}
                {copiedId === template.id ? "Tersalin!" : "Salin"}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <AdminLayout desc="SSO Integration">
      <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
              <Code2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                SSO Integration
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-0.5">
                Template kode integrasi SSO untuk berbagai bahasa & framework
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px] h-11 rounded-xl border-gray-200 bg-gray-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari template..."
                className="pl-9 h-11 bg-gray-50 border-gray-200 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              className="h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-5"
              onClick={handleOpenCreate}
            >
              <Plus size={18} className="mr-1.5" strokeWidth={2.5} />
              Tambah
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Template",
              value: templates.length,
              icon: <Code2 size={18} className="text-emerald-600" />,
              bg: "bg-emerald-50",
            },
            {
              label: "Frontend",
              value: templates.filter((t: any) => t.category === "frontend")
                .length,
              icon: <Globe size={18} className="text-blue-600" />,
              bg: "bg-blue-50",
            },
            {
              label: "Backend",
              value: templates.filter((t: any) => t.category === "backend")
                .length,
              icon: <Server size={18} className="text-purple-600" />,
              bg: "bg-purple-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`p-2.5 rounded-xl ${s.bg}`}>{s.icon}</div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {s.label}
                </p>
                <p className="text-2xl font-extrabold text-gray-900 mt-0.5">
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        )}

        {/* Frontend Section */}
        {!isLoading && frontend.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <Globe size={16} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Frontend</h2>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                {frontend.length} template
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {frontend.map((t: any) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </div>
        )}

        {/* Backend Section */}
        {!isLoading && backend.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <Server size={16} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900">Backend</h2>
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100">
                {backend.length} template
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {backend.map((t: any) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </div>
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[1.5rem] border border-gray-100">
            <Code2 size={40} className="text-gray-200 mb-3" />
            <p className="font-bold text-gray-500">
              Tidak ada template ditemukan.
            </p>
          </div>
        )}
      </div>

      {/* Dialog Create/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] rounded-2xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              {selectedTemplate ? "Edit Template" : "Tambah Template Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Nama Framework *
                </label>
                <Input
                  placeholder="e.g. Next.js, Laravel"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Kategori *
                </label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Bahasa *
                </label>
                <Select
                  value={form.language}
                  onValueChange={(v) => setForm({ ...form, language: v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="php">PHP</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="go">Go</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Order</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Deskripsi
              </label>
              <Input
                placeholder="Deskripsi singkat template ini"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Dependencies / Instalasi
              </label>
              <Input
                placeholder="e.g. npm install axios"
                value={form.dependencies}
                onChange={(e) =>
                  setForm({ ...form, dependencies: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">
                Kode Snippet *
              </label>
              <textarea
                placeholder="Paste kode integrasi SSO di sini..."
                value={form.code_snippet}
                onChange={(e) =>
                  setForm({ ...form, code_snippet: e.target.value })
                }
                className="w-full min-h-[200px] px-4 py-3 text-xs font-mono bg-gray-950 text-gray-100 border border-gray-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="w-4 h-4 rounded accent-emerald-600"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-bold text-gray-700"
              >
                Aktif
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              onClick={handleSubmit}
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              {selectedTemplate ? "Simpan Perubahan" : "Tambah Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-extrabold text-gray-900">
              Hapus Template
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Yakin ingin menghapus template{" "}
            <span className="font-bold text-gray-900">
              {selectedTemplate?.name}
            </span>
            ? Aksi ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : null}
              Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SsoKeys;
