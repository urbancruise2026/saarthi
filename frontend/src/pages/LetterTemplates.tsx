import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { updateTemplate } from "@/redux/letterSlice";
import { DOC_TYPE_LABELS } from "@/utils/documentGenerators";
import { LetterTemplate } from "@/types/letter";
import { FileText, Save, Eye, RotateCcw, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LetterTemplates() {
  const dispatch = useAppDispatch();
  const templates = useAppSelector((s) => s.letters.templates);

  const [selected, setSelected] = useState<LetterTemplate | null>(
    templates[0] || null,
  );
  const [editContent, setEditContent] = useState(templates[0]?.content || "");
  const [previewOpen, setPreviewOpen] = useState(false);

  const selectTemplate = (tpl: LetterTemplate) => {
    setSelected(tpl);
    setEditContent(tpl.content);
  };

  const handleSave = () => {
    if (!selected) return;
    dispatch(
      updateTemplate({
        ...selected,
        content: editContent,
        updatedAt: new Date().toISOString(),
      }),
    );
    toast.success("Template saved successfully!");
  };

  const handleReset = () => {
    if (selected) setEditContent(selected.content);
    toast.info("Changes reverted");
  };

  const renderPreview = () => {
    if (!selected) return "";
    let text = editContent;
    selected.placeholders.forEach((p) => {
      text = text.replace(
        new RegExp(`{{${p}}}`, "g"),
        `<span style="background:hsl(var(--primary)/0.15);color:hsl(var(--primary));padding:1px 6px;border-radius:4px;font-weight:600;">{{${p}}}</span>`,
      );
    });
    return text.replace(/\n/g, "<br/>");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Letter Templates</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize letter templates with placeholders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Template list */}
        <div className="space-y-2">
          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => selectTemplate(tpl)}
              className="w-full p-3 rounded-xl border-2 text-left transition-all hover:shadow-md"
              style={{
                borderColor:
                  selected?.id === tpl.id
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
                background:
                  selected?.id === tpl.id
                    ? "hsl(var(--primary) / 0.05)"
                    : "hsl(var(--card))",
                boxShadow:
                  selected?.id === tpl.id
                    ? "var(--shadow-elevated)"
                    : "var(--shadow-card)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <FileText size={14} style={{ color: "hsl(var(--primary))" }} />
                <span className="text-sm font-semibold text-foreground">
                  {DOC_TYPE_LABELS[tpl.letterType]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{tpl.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Updated: {format(new Date(tpl.updatedAt), "dd MMM yyyy")}
              </p>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-4">
          {selected ? (
            <>
              <div
                className="rounded-2xl border border-border bg-card p-6"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {selected.name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {DOC_TYPE_LABELS[selected.letterType]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewOpen(true)}
                      className="gap-1.5"
                    >
                      <Eye size={14} /> Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReset}
                      className="gap-1.5"
                    >
                      <RotateCcw size={14} /> Reset
                    </Button>
                    <Button size="sm" onClick={handleSave} className="gap-1.5">
                      <Save size={14} /> Save
                    </Button>
                  </div>
                </div>

                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={16}
                  className="w-full p-4 rounded-xl border border-input bg-background text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                  placeholder="Template content..."
                />
              </div>

              {/* Placeholders */}
              <div
                className="rounded-2xl border border-border bg-card p-4"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Code size={14} style={{ color: "hsl(var(--primary))" }} />
                  <h3 className="text-sm font-semibold text-foreground">
                    Available Placeholders
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.placeholders.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setEditContent((prev) => prev + `{{${p}}}`);
                        toast.info(`Inserted {{${p}}}`);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors hover:shadow-sm"
                      style={{
                        background: "hsl(var(--primary) / 0.1)",
                        color: "hsl(var(--primary))",
                      }}
                    >
                      {`{{${p}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div
              className="rounded-2xl border border-border bg-card p-12 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <FileText
                size={40}
                className="mx-auto text-muted-foreground/40 mb-3"
              />
              <p className="text-muted-foreground text-sm">
                Select a template to edit
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Template Preview —{" "}
              {selected && DOC_TYPE_LABELS[selected.letterType]}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border border-border p-6 space-y-4">
            <div
              className="rounded-lg p-4 text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              <h2 className="text-lg font-bold">HRMS Enterprise Suite</h2>
              <p className="text-xs opacity-80">
                admin@company.com | www.hrmsportal.com
              </p>
            </div>
            <div
              className="text-sm leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: renderPreview() }}
            />
            <div className="flex justify-between pt-4 border-t border-border text-xs text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground">
                  Authorised Signatory
                </p>
                <p>HRMS Enterprise Suite</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">HR Department</p>
                <p>Human Resources</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
