import { useEffect, useRef, useState } from "react";

const CvEditor = ({ initialHtml = "", onChange }) => {
  const ref = useRef(null);
  const [selectedMark, setSelectedMark] = useState(null);
  const [markTooltip, setMarkTooltip] = useState(null);

  useEffect(() => {
    if (!ref.current || initialHtml === undefined) return;

    // If the editor currently has focus (user typing), don't overwrite innerHTML
    // This prevents parent-driven prop updates from resetting scroll / cursor.
    const editorHasFocus = ref.current.contains(document.activeElement);
    if (editorHasFocus) {
      // ensure marks have listeners, but don't replace content
      attachMarkListeners();
      return;
    }

    // Only replace innerHTML if it's actually different to avoid unnecessary DOM churn
    if (ref.current.innerHTML !== initialHtml) {
      ref.current.innerHTML = initialHtml;
    }
    attachMarkListeners();
  }, [initialHtml]);

  const attachMarkListeners = () => {
    if (!ref.current) return;
    const marks = ref.current.querySelectorAll("mark");
    marks.forEach((mark, idx) => {
      mark.id = `mark-${idx}`;
      mark.style.position = "relative";
      mark.style.cursor = "pointer";
      // remove existing to avoid duplicate handlers
      mark.removeEventListener("click", handleMarkClick);
      mark.addEventListener("click", handleMarkClick);
    });
  };

  const handleMarkClick = (e) => {
    e.stopPropagation();
    const mark = e.target.closest("mark");
    if (!mark) return;

    const rect = mark.getBoundingClientRect();
    const editorRect = ref.current?.getBoundingClientRect();

    setSelectedMark(mark.id);
    setMarkTooltip({
      top: rect.top - editorRect.top - 40,
      left: rect.left - editorRect.left + rect.width / 2 - 60,
      markId: mark.id
    });
  };

  const handleKeep = () => {
    const mark = ref.current?.querySelector(`#${markTooltip.markId}`);
    if (mark) {
      // Replace <mark>text</mark> with just text (remove mark, keep the new content)
      const parent = mark.parentNode;
      while (mark.firstChild) {
        parent.insertBefore(mark.firstChild, mark);
      }
      parent.removeChild(mark);
      
      // Notify parent of change
      onChange && onChange(ref.current.innerHTML);
    }
    setMarkTooltip(null);
    setSelectedMark(null);
  };

  const handleRevert = () => {
    const mark = ref.current?.querySelector(`#${markTooltip.markId}`);
    if (mark) {
      // Remove the entire marked element (reverts to original by removing the suggestion)
      mark.remove();
      
      // Notify parent of change
      onChange && onChange(ref.current.innerHTML);
    }
    setMarkTooltip(null);
    setSelectedMark(null);
  };

  const handleInput = () => {
    if (!ref.current) return;
    
    // Save scroll position before any DOM changes
    const scrollTop = ref.current.scrollTop;
    const scrollLeft = ref.current.scrollLeft;
    
    // Save cursor position before notifying parent
    const selection = window.getSelection();
    let cursorOffset = 0;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(ref.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      cursorOffset = preCaretRange.toString().length;
    }

    // Call onChange without innerHTML manipulation
    onChange && onChange(ref.current.innerHTML);

    // Re-attach listeners after manual edits
    attachMarkListeners();
    
     // Close tooltip if editor content changes
     setMarkTooltip(null);
     setSelectedMark(null);
    
    // Restore cursor position and scroll position
    setTimeout(() => {
      if (ref.current && cursorOffset >= 0) {
        const selection = window.getSelection();
        const range = document.createRange();
        let charCount = 0;
        let nodeStack = [ref.current];
        let node, foundStart = false;

        while (!foundStart && (node = nodeStack.pop())) {
          if (node.nodeType === 3) {
            const nextCharCount = charCount + node.length;
            if (cursorOffset <= nextCharCount) {
              range.setStart(node, cursorOffset - charCount);
              foundStart = true;
            }
            charCount = nextCharCount;
          } else {
            for (let i = node.childNodes.length - 1; i >= 0; i--) {
              nodeStack.push(node.childNodes[i]);
            }
          }
        }

        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Restore scroll position
        ref.current.scrollTop = scrollTop;
        ref.current.scrollLeft = scrollLeft;
      }
    }, 0);
  };

  const handleEditorClick = (e) => {
    // Close tooltip when clicking elsewhere in editor (but not on marks)
    if (!e.target.closest("mark")) {
      setMarkTooltip(null);
      setSelectedMark(null);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={ref}
        onInput={handleInput}
        onClick={handleEditorClick}
        contentEditable
        className="w-full min-h-[360px] p-4 border border-slate-200 rounded-md bg-white text-foreground overflow-auto"
        style={{ whiteSpace: "pre-wrap", outline: "none" }}
        aria-label="CV editor"
        suppressContentEditableWarning
      />
      
      {/* Tooltip with Keep/Revert buttons - shows on click and stays until selection */}
      {markTooltip && selectedMark === markTooltip.markId && (
        <div
          style={{
            position: "absolute",
            top: `${markTooltip.top}px`,
            left: `${markTooltip.left}px`,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            display: "flex",
            gap: "8px",
            zIndex: 1000,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
        >
          <button
            onClick={handleKeep}
            style={{
              padding: "4px 12px",
              backgroundColor: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            Keep
          </button>
          <button
            onClick={handleRevert}
            style={{
              padding: "4px 12px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500"
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            Revert
          </button>
        </div>
      )}
    </div>
  );
};

export default CvEditor;