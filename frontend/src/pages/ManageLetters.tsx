import { useState, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { deleteLetter, updateLetterStatus } from "@/redux/letterSlice";
import { DOC_TYPE_LABELS, DocType, generatePDF, getFilename } from "@/utils/documentGenerators";
import { Employee } from "@/types";
import { Letter, LetterStatus } from "@/types/letter";
import { Search, Download, Eye, Trash2, Edit, FileText, Filter, ChevronLeft, ChevronRight, Send, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import DocumentPreviewModal from "@/components/DocumentPreviewModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const STATUS_STYLES: Record<LetterStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: "hsl(var(--warning-light))", color: "hsl(var(--warning))", label: "Draft" },
  issued: { bg: "hsl(var(--success-light))", color: "hsl(var(--success))", label: "Issued" },
  sent: { bg: "hsl(var(--primary) / 0.12)", color: "hsl(var(--primary))", label: "Sent" },
};

const PAGE_SIZE = 8;

export default function ManageLetters() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const letters = useAppSelector((s) => s.letters.letters);
  const employees = useAppSelector((s) => s.employees.employees);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DocType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<LetterStatus | "all">("all");
  const [page, setPage] = useState(0);
  const [previewLetter, setPreviewLetter] = useState<Letter | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return letters.filter((l) => {
      const matchSearch = l.employeeName.toLowerCase().includes(search.toLowerCase()) ||
        l.letterType.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || l.letterType === typeFilter;
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [letters, search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const getEmployee = (empId: string) => employees.find((e) => e.id === empId);

  const handleDownload = (letter: Letter) => {
    const emp = getEmployee(letter.employeeId);
    if (!emp) return toast.error("Employee not found");
    const doc = generatePDF(emp, letter.letterType);
    doc.save(getFilename(emp, letter.letterType));
    toast.success("PDF downloaded!");
  };

  const handleDelete = (id: string) => {
    dispatch(deleteLetter(id));
    setDeleteConfirm(null);
    toast.success("Letter deleted");
  };

  const handleSendEmail = (letter: Letter) => {
    dispatch(updateLetterStatus({ id: letter.id, status: "sent" }));
    toast.success("Email sent successfully! (Simulated)", { description: `${DOC_TYPE_LABELS[letter.letterType]} sent to ${letter.employeeName}` });
  };

  const previewEmployee = previewLetter ? getEmployee(previewLetter.employeeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Manage Letters</h1>
          <p className="text-sm text-muted-foreground mt-1">View, edit, and manage all generated letters</p>
        </div>
        <Button onClick={() => navigate("/documents/create")} className="gap-2">
          <FileText size={14} /> Create New Letter
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search by name or type…" className="pl-9" />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value as DocType | "all"); setPage(0); }}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Types</option>
          {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as LetterStatus | "all"); setPage(0); }}
          className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="issued">Issued</option>
          <option value="sent">Sent</option>
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <FileText size={40} className="mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground text-sm">No letters found. Create your first letter to get started.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border" style={{ background: "hsl(var(--muted) / 0.5)" }}>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Employee</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Letter Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Created</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((letter) => {
                  const st = STATUS_STYLES[letter.status];
                  return (
                    <tr key={letter.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "var(--gradient-primary)" }}>
                            {letter.employeeName.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{letter.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{letter.employeeDepartment}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{DOC_TYPE_LABELS[letter.letterType]}</td>
                      <td className="px-4 py-3 text-muted-foreground">{format(new Date(letter.createdAt), "dd MMM yyyy")}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setPreviewLetter(letter)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="View">
                            <Eye size={15} className="text-muted-foreground" />
                          </button>
                          <button onClick={() => handleDownload(letter)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Download">
                            <Download size={15} className="text-muted-foreground" />
                          </button>
                          {letter.status !== "sent" && (
                            <button onClick={() => handleSendEmail(letter)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Send Email">
                              <Mail size={15} className="text-muted-foreground" />
                            </button>
                          )}
                          <button onClick={() => setDeleteConfirm(letter.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors" title="Delete">
                            <Trash2 size={15} className="text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
                  <ChevronLeft size={14} />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button key={i} size="sm" variant={i === page ? "default" : "outline"} onClick={() => setPage(i)}>
                    {i + 1}
                  </Button>
                ))}
                <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview modal */}
      {previewLetter && previewEmployee && (
        <DocumentPreviewModal
          open={!!previewLetter}
          onClose={() => setPreviewLetter(null)}
          employee={previewEmployee}
          docType={previewLetter.letterType}
        />
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Letter?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. The letter will be permanently removed.</p>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
