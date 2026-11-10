import React, { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Plus,
  Search,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Tag,
  X,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useNoticeSocket } from "@/hooks/useNoticeSocket";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import {
  addNotice,
  editNotice,
  fetchNotices,
  removeNotice,
} from "@/redux/features/Notice/noticeSlice";
import { Notice } from "@/types";
import RichTextEditor from "@/components/addFromModels/RichTextEditor";


type StatusType = "Active" | "Inactive";
type CategoryType = "General" | "Important" | "Event" | "Update";

const defaultForm: Partial<Notice> = {
  title: "",
  description: "",
  category: "General",
  notice_date: "",
  status: "Active",
};

const STATUS_STYLES: Record<StatusType, string> = {
  Active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Inactive: "bg-muted text-muted-foreground",
};

const ITEMS_PER_PAGE = 5;

export default function NoticeManager() {
  const dispatch = useAppDispatch();
  const { notices, loading, actionLoading } = useAppSelector(
    (state) => state.notice,
  );

  // socket logic hook me
  useNoticeSocket();

  const [form, setForm] = useState<Partial<Notice>>(defaultForm);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | StatusType>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | CategoryType>(
    "all",
  );
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchNotices());
  }, [dispatch]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditId(null);
  };

  const openAddDialog = () => {
    resetForm();
    setOpenFormDialog(true);
  };

  const openEditDialog = (item: Notice) => {
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      notice_date: item.notice_date,
      status: item.status,
    });
    setEditId(item.id);
    setOpenFormDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title?.trim() || !form.description?.trim() || !form.notice_date) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editId !== null) {
        await dispatch(
          editNotice({
            id: editId,
            data: form,
          }),
        ).unwrap();

        toast.success("Notice updated successfully");
      } else {
        await dispatch(addNotice(form)).unwrap();
        toast.success("Notice added successfully");
      }

      resetForm();
      setOpenFormDialog(false);
    } catch (error: any) {
      toast.error(error || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    try {
      await dispatch(removeNotice(deleteId)).unwrap();
      toast.success("Notice deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error || "Failed to delete notice");
    }
  };

  const filtered = useMemo(() => {
    return (notices || []).filter((n: Notice) => {
      const matchSearch =
        n.title?.toLowerCase().includes(search.toLowerCase()) ||
        n.description?.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "all" || n.status === statusFilter;
      const matchCategory =
        categoryFilter === "all" || n.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [notices, search, statusFilter, categoryFilter]);

  useEffect(() => {
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [filtered.length, page]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const formatNoticeDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Notices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} notice{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <Button
          onClick={openAddDialog}
          className="inline-flex items-center gap-2 rounded-lg"
        >
          <Plus size={15} />
          Add Notice
        </Button>
      </div>

      {/* Filters */}
      <div className="stat-card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title or description..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v as "all" | CategoryType);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <Filter size={14} className="mr-1 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="Important">Important</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
              <SelectItem value="Update">Update</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as "all" | StatusType);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="stat-card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-sm uppercase">Title</th>
                <th className="text-left px-4 py-3 text-sm uppercase hidden md:table-cell">
                  Description
                </th>
                <th className="text-left px-4 py-3 text-sm uppercase hidden lg:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-sm uppercase hidden xl:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-sm uppercase">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Loading notices...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No notices found.
                  </td>
                </tr>
              ) : (
                paginated.map((notice: Notice) => (
                  <tr key={notice.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3.5">
                      <p className="font-medium">{notice.title}</p>
                    </td>

                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {/* HTML strip karke plain text dikhao table mein */}
                      <p
                        className="max-w-xs truncate text-muted-foreground"
                        dangerouslySetInnerHTML={{
                          __html: notice.description,
                        }}
                      />
                    </td>

                    <td className="px-4 py-3.5 hidden lg:table-cell text-muted-foreground">
                      {notice.category}
                    </td>

                    <td className="px-4 py-3.5 hidden xl:table-cell text-muted-foreground">
                      {formatNoticeDate(notice.notice_date)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          STATUS_STYLES[notice.status as StatusType]
                        }`}
                      >
                        {notice.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          title="View Notice"
                          onClick={() => setViewNotice(notice)}
                          className="p-1.5 rounded border bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          title="Edit Notice"
                          onClick={() => openEditDialog(notice)}
                          className="p-1.5 rounded border bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          title="Delete Notice"
                          onClick={() => setDeleteId(notice.id)}
                          className="p-1.5 rounded border bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={openFormDialog}
        onOpenChange={(open) => {
          setOpenFormDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[650px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editId !== null ? "Edit Notice" : "Add Notice"}
            </DialogTitle>
            <DialogDescription>
              Fill the form below and save your notice.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={(form.category as string) || "General"}
                onValueChange={(v: CategoryType) =>
                  setForm({ ...form, category: v })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Update">Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={(form.notice_date as string) || ""}
                onChange={(e) =>
                  setForm({ ...form, notice_date: e.target.value })
                }
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={(form.status as string) || "Active"}
                onValueChange={(v: StatusType) =>
                  setForm({ ...form, status: v })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Textarea → RichTextEditor */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                value={form.description || ""}
                onChange={(val) => setForm({ ...form, description: val })}
                placeholder="Enter notice details..."
              />
            </div>

            <DialogFooter className="md:col-span-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  resetForm();
                  setOpenFormDialog(false);
                }}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="rounded-xl"
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Saving..."
                  : editId !== null
                    ? "Update Notice"
                    : "Save Notice"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Notice Dialog */}
      <Dialog
        open={!!viewNotice}
        onOpenChange={(open) => {
          if (!open) setViewNotice(null);
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full sm:max-w-[560px] translate-x-[-50%] translate-y-[-50%] rounded-2xl p-0 overflow-hidden shadow-lg bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            {viewNotice && (
              <>
                {/* ── Top color banner ── */}
                <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-5 border-b border-border">
                  {/* Category + Status badges — top row */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                      <Tag size={10} />
                      {viewNotice.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        STATUS_STYLES[viewNotice.status as StatusType]
                      }`}
                    >
                      {viewNotice.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-foreground leading-snug pr-8">
                    {viewNotice.title}
                  </h2>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 mt-2.5 text-muted-foreground">
                    <Calendar size={13} />
                    <span className="text-xs">
                      {formatNoticeDate(viewNotice.notice_date)}
                    </span>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setViewNotice(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full bg-red-500 hover:bg-red-700 text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* ── Description body ── */}
                <div className="px-6 py-5 max-h-[380px] overflow-y-auto">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-3">
                    Description
                  </p>
                  <div
                    className="text-sm leading-relaxed text-foreground"
                    dangerouslySetInnerHTML={{ __html: viewNotice.description }}
                  />
                </div>

                {/* ── Footer ── */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20">
                  <Button
                    variant="outline"
                    className="rounded-xl h-9 px-5 text-sm"
                    onClick={() => setViewNotice(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="rounded-xl h-9 px-5 text-sm"
                    onClick={() => {
                      openEditDialog(viewNotice);
                      setViewNotice(null);
                    }}
                  >
                    <Pencil size={13} className="mr-1.5" />
                    Edit
                  </Button>
                </div>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
      >
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Notice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this notice? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setDeleteId(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
