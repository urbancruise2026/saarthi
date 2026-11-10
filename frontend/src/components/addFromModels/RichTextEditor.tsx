import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const COLORS = [
  // Reds / Pinks
  "#ef4444",
  "#e24b4a",
  "#be185d",
  "#ec4899",
  "#f43f5e",
  // Oranges / Yellows
  "#f97316",
  "#d97706",
  "#eab308",
  "#ca8a04",
  // Greens
  "#16a34a",
  "#22c55e",
  "#0f766e",
  "#14b8a6",
  // Blues
  "#3b82f6",
  "#1d4ed8",
  "#0ea5e9",
  "#0284c7",
  // Purples
  "#9333ea",
  "#7c3aed",
  "#a855f7",
  "#6366f1",
  // Neutrals
  "#1f2937",
  "#6b7280",
  "#000000",
];

const HIGHLIGHTS = [
  "#fef08a",
  "#fde047",
  "#fbbf24", // Yellows
  "#bbf7d0",
  "#86efac",
  "#6ee7b7", // Greens
  "#bfdbfe",
  "#93c5fd",
  "#a5f3fc", // Blues
  "#fbcfe8",
  "#f9a8d4",
  "#fda4af", // Pinks
  "#e9d5ff",
  "#d8b4fe",
  "#c4b5fd", // Purples
  "#fed7aa",
  "#fdba74",
  "#fca5a5", // Oranges/Reds
];

const FONT_SIZES = [
  { label: "10", value: "10px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRange = useRef<Range | null>(null);
  const isInternal = useRef(false);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [activeFontSize, setActiveFontSize] = useState("14px");

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      isInternal.current = false;
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  // ✅ KEY FIX: mousedown pe hi selection save karo — click se pehle
  // Jab user toolbar button pe click karta hai, editor ka focus pehle chala
  // jaata tha aur selection lost ho jaati thi. Ab mousedown (click se pehle)
  // hi selection save ho jaati hai, isliye ek hi click mein kaam karta hai.
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    editorRef.current?.focus();
    if (!savedRange.current) return;
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(savedRange.current);
  };

  const fmt = (cmd: string) => {
    restoreSelection();
    document.execCommand(cmd, false, undefined);
    triggerChange();
  };

  const applyFontSize = (size: string) => {
    restoreSelection();
    document.execCommand("fontSize", false, "7");
    const els = editorRef.current?.querySelectorAll('font[size="7"]');
    els?.forEach((el) => {
      (el as HTMLElement).removeAttribute("size");
      (el as HTMLElement).style.fontSize = size;
    });
    setActiveFontSize(size);
    setShowFontSize(false);
    triggerChange();
  };

  const applyColor = (color: string, type: "text" | "bg") => {
    restoreSelection();
    document.execCommand(
      type === "text" ? "foreColor" : "hiliteColor",
      false,
      color,
    );
    triggerChange();
    if (type === "text") setShowColorPicker(false);
    else setShowHighlightPicker(false);
  };

  const triggerChange = () => {
    if (editorRef.current) {
      isInternal.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const closeAll = () => {
    setShowColorPicker(false);
    setShowHighlightPicker(false);
    setShowFontSize(false);
  };

  // ✅ Toolbar button ke mousedown pe selection save karo + default prevent karo
  // preventDefault isliye zaroori hai taaki editor ka focus na jaye
  const toolbarMouseDown = (e: React.MouseEvent) => {
    saveSelection();
    e.preventDefault();
  };

  const btnClass =
    "p-1.5 rounded border border-border bg-background hover:bg-muted text-foreground text-xs h-7 min-w-[28px] flex items-center justify-center gap-1 cursor-pointer select-none transition-colors";

  return (
    <div className="rounded-xl border border-border overflow-visible">
      {/* Toolbar — onMouseDown pe saveSelection + preventDefault */}
      <div
        className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-muted/40 border-b border-border rounded-t-xl"
        onMouseDown={toolbarMouseDown}
      >
        {/* ── Font Size Dropdown ── */}
        <div className="relative">
          <button
            type="button"
            className={`${btnClass} w-[68px]`}
            onClick={() => {
              closeAll();
              setShowFontSize((p) => !p);
            }}
            title="Font size"
          >
            <span>{activeFontSize.replace("px", "")}px</span>
            <ChevronDown size={11} />
          </button>

          {showFontSize && (
            <div className="absolute top-8 left-0 z-50 bg-background border border-border rounded-lg shadow-lg py-1 w-24 max-h-52 overflow-y-auto">
              {FONT_SIZES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => applyFontSize(f.value)}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors ${
                    activeFontSize === f.value
                      ? "font-semibold text-primary bg-muted"
                      : "text-foreground"
                  }`}
                >
                  {f.label}px
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-border mx-0.5" />

        {/* ── Format Buttons ── */}
        <button
          type="button"
          className={btnClass}
          onClick={() => fmt("bold")}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => fmt("italic")}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => fmt("underline")}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => fmt("strikeThrough")}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <span className="w-px h-5 bg-border mx-0.5" />

        {/* ── Text Color Dropdown ── */}
        <div className="relative">
          <button
            type="button"
            className={`${btnClass} px-2`}
            onClick={() => {
              closeAll();
              setShowColorPicker((p) => !p);
            }}
            title="Text color"
          >
            <span
              className="text-xs font-bold underline"
              style={{ color: "#e24b4a" }}
            >
              A
            </span>
            <ChevronDown size={11} />
          </button>

          {showColorPicker && (
            <div className="absolute top-8 left-0 z-50 bg-background border border-border rounded-lg shadow-lg p-2.5 w-48">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Text Color
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applyColor(c, "text")}
                    className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform cursor-pointer"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Highlight Color Dropdown ── */}
        <div className="relative">
          <button
            type="button"
            className={`${btnClass} px-2`}
            onClick={() => {
              closeAll();
              setShowHighlightPicker((p) => !p);
            }}
            title="Highlight color"
          >
            <span
              className="text-xs font-bold"
              style={{
                background: "#fef08a",
                borderRadius: 2,
                padding: "0 3px",
                color: "#000",
              }}
            >
              H
            </span>
            <ChevronDown size={11} />
          </button>

          {showHighlightPicker && (
            <div className="absolute top-8 left-0 z-50 bg-background border border-border rounded-lg shadow-lg p-2.5 w-48">
              <p className="text-[10px] text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                Highlight Color
              </p>
              <div className="grid grid-cols-6 gap-1.5">
                {HIGHLIGHTS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => applyColor(c, "bg")}
                    className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform cursor-pointer"
                    style={{ background: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="w-px h-5 bg-border mx-0.5" />

        {/* ── Clear Formatting ── */}
        <button
          type="button"
          className={`${btnClass} px-2 text-muted-foreground hover:text-destructive`}
          onClick={() => fmt("removeFormat")}
          title="Clear formatting"
        >
          ✕
        </button>
      </div>

      {/* Click outside → close dropdowns */}
      {(showColorPicker || showHighlightPicker || showFontSize) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}

      {/* ── Editor Area ── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerChange}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        onClick={closeAll}
        className="min-h-[130px] px-3 py-2.5 text-sm leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        data-placeholder={placeholder || "Enter notice details..."}
      />
    </div>
  );
}
