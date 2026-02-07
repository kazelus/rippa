"use client";

import { useRef, useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Wpisz treść...",
  minHeight = "160px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value → editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const exec = useCallback(
    (command: string, value?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      handleInput();
    },
    [handleInput],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        exec("insertText", "    ");
      }
    },
    [exec],
  );

  const ToolButton = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-[#1b3caf] text-white"
          : "text-[#b0b0b0] hover:text-white hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="rounded-lg border border-[#1b3caf]/30 bg-[#1a1f2e] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-[#1b3caf]/20 bg-[#151a24]">
        <ToolButton onClick={() => exec("bold")} title="Pogrubienie (Ctrl+B)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
          </svg>
        </ToolButton>
        <ToolButton onClick={() => exec("italic")} title="Kursywa (Ctrl+I)">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
          </svg>
        </ToolButton>
        <ToolButton
          onClick={() => exec("underline")}
          title="Podkreślenie (Ctrl+U)"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
          </svg>
        </ToolButton>

        <div className="w-px h-5 bg-[#1b3caf]/30 mx-1" />

        <ToolButton
          onClick={() => exec("insertUnorderedList")}
          title="Lista punktowana"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </ToolButton>
        <ToolButton
          onClick={() => exec("insertOrderedList")}
          title="Lista numerowana"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <line x1="10" y1="6" x2="20" y2="6" />
            <line x1="10" y1="12" x2="20" y2="12" />
            <line x1="10" y1="18" x2="20" y2="18" />
            <text
              x="4"
              y="8"
              fill="currentColor"
              fontSize="8"
              fontWeight="bold"
              stroke="none"
            >
              1
            </text>
            <text
              x="4"
              y="14"
              fill="currentColor"
              fontSize="8"
              fontWeight="bold"
              stroke="none"
            >
              2
            </text>
            <text
              x="4"
              y="20"
              fill="currentColor"
              fontSize="8"
              fontWeight="bold"
              stroke="none"
            >
              3
            </text>
          </svg>
        </ToolButton>

        <div className="w-px h-5 bg-[#1b3caf]/30 mx-1" />

        <ToolButton
          onClick={() => exec("formatBlock", "<h3>")}
          title="Nagłówek"
        >
          <span className="text-xs font-bold px-0.5">H</span>
        </ToolButton>
        <ToolButton
          onClick={() => exec("formatBlock", "<h4>")}
          title="Podtytuł"
        >
          <span className="text-[10px] font-bold px-0.5">H2</span>
        </ToolButton>
        <ToolButton onClick={() => exec("formatBlock", "<p>")} title="Akapit">
          <span className="text-xs px-0.5">¶</span>
        </ToolButton>

        <div className="w-px h-5 bg-[#1b3caf]/30 mx-1" />

        <ToolButton
          onClick={() => exec("formatBlock", "<blockquote>")}
          title="Cytat"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </ToolButton>
        <ToolButton onClick={() => exec("strikeThrough")} title="Przekreślenie">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
          </svg>
        </ToolButton>

        <div className="w-px h-5 bg-[#1b3caf]/30 mx-1" />

        <ToolButton
          onClick={() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = "";
              onChange("");
            }
          }}
          title="Wyczyść formatowanie"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" d="M4 7h16M10 11l4 4m0-4l-4 4" />
          </svg>
        </ToolButton>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className="px-4 py-3 text-white text-base focus:outline-none rich-editor"
        style={{ minHeight }}
      />

      {/* Styles for the editor content */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }
        .rich-editor ul {
          list-style-type: none !important;
          padding-left: 0 !important;
          margin: 0.5em 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.4em !important;
        }
        .rich-editor ol {
          list-style-type: none !important;
          padding-left: 0 !important;
          margin: 0.5em 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 0.4em !important;
          counter-reset: item;
        }
        .rich-editor ul > li {
          display: flex !important;
          align-items: flex-start !important;
          gap: 0.6em;
          padding: 0.4em 0.75em;
          background: rgba(27, 60, 175, 0.08);
          border-left: 2px solid rgba(27, 60, 175, 0.4);
          border-radius: 0 0.4em 0.4em 0;
        }
        .rich-editor ul > li::before {
          content: "";
          flex-shrink: 0;
          width: 5px;
          height: 5px;
          margin-top: 0.5em;
          background: #1b3caf;
          border-radius: 1px;
          transform: rotate(45deg);
        }
        .rich-editor ol > li {
          display: flex !important;
          align-items: flex-start !important;
          gap: 0.6em;
          padding: 0.4em 0.75em;
          background: rgba(27, 60, 175, 0.08);
          border-left: 2px solid rgba(27, 60, 175, 0.4);
          border-radius: 0 0.4em 0.4em 0;
          counter-increment: item;
        }
        .rich-editor ol > li::before {
          content: counter(item);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 1.4em;
          height: 1.4em;
          font-size: 0.7em;
          font-weight: 700;
          color: white;
          background: #1b3caf;
          border-radius: 0.3em;
        }
        .rich-editor h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0.75em 0 0.5em;
          color: white;
        }
        .rich-editor h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0.5em 0 0.35em;
          color: #d0d8e6;
        }
        .rich-editor p {
          margin: 0.35em 0;
        }
        .rich-editor blockquote {
          border-left: 3px solid #1b3caf;
          padding-left: 1em;
          margin: 0.5em 0;
          color: #b0b0b0;
          font-style: italic;
        }
        .rich-editor b, .rich-editor strong {
          font-weight: 700;
          color: white;
        }
        .rich-editor s, .rich-editor strike {
          text-decoration: line-through;
          opacity: 0.7;
        }
      `,
        }}
      />
    </div>
  );
}
