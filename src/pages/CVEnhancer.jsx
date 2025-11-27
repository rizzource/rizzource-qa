import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import CvEditor from "@/components/cv/CvEditor";
import { ArrowLeft } from "lucide-react";
// new import for Word generation
import { Document, Packer, Paragraph, TextRun } from "docx";

const CVEnhancer = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [originalText, setOriginalText] = useState("");
  const [enhancedText, setEnhancedText] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [processing, setProcessing] = useState(false);
  const [originalEnhancedMap, setOriginalEnhancedMap] = useState({}); // Map of original->enhanced for reverting

  useEffect(() => {
    if (!user) {
      toast.error("Please sign in to use the CV Enhancer");
      navigate("/auth");
      return;
    }
    (async () => {
      try {
        await fetchJob();
        await fetchUserProfile();
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, [jobId, user]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single();
      if (error) throw error;
      setJob(data);
    } catch (err) {
      console.error("Error fetching job:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("resume_url, resume_file_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
      if (data?.resume_url) {
        const extracted = await extractWorkHistoryFromPdf(data.resume_url, data);
        setOriginalText(extracted || "");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  // copy of the PDF text extraction logic (kept locally to avoid refactor)
  const extractWorkHistoryFromPdf = async (pdfUrl, profile) => {
    try {
      let arrayBuffer = null;
      try {
        const res = await fetch(pdfUrl);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        arrayBuffer = await res.arrayBuffer();
      } catch (fetchErr) {
        // attempt Supabase storage download using known buckets/filename
        const tryDownloadFromSupabase = async (bucket, path) => {
          try {
            const { data, error } = await supabase.storage.from(bucket).download(path);
            if (error) throw error;
            return await data.arrayBuffer();
          } catch (err) {
            return null;
          }
        };

        try {
          const parsed = new URL(pdfUrl);
          const storagePrefix = "/storage/v1/object/public/";
          const idx = parsed.pathname.indexOf(storagePrefix);
          if (idx !== -1) {
            const storagePath = decodeURIComponent(parsed.pathname.substring(idx + storagePrefix.length));
            const parts = storagePath.split("/");
            const bucket = parts.shift();
            const path = parts.join("/");
            arrayBuffer = await tryDownloadFromSupabase(bucket, path);
          }
        } catch (err) {
          /* ignore */
        }

        if (!arrayBuffer && profile?.resume_file_name) {
          const candidateBuckets = ["assets", "resumes", "resumes-public", "public"];
          for (const b of candidateBuckets) {
            const ab = await tryDownloadFromSupabase(b, profile.resume_file_name);
            if (ab) {
              arrayBuffer = ab;
              break;
            }
          }
        }

        if (!arrayBuffer) {
          throw new Error("Unable to obtain resume PDF bytes");
        }
      }

      const uint8 = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: uint8, disableWorker: true });
      const pdf = await loadingTask.promise;

      // Improved extraction that clusters into columns before emitting lines.
      // This helps preserve logical sections for multi-column / parallel layouts.
      const pageTexts = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        // Map text items to x,y and text
        const items = content.items.map(it => {
          const t = it.transform || [];
          const x = t[4] || 0;
          const y = t[5] || 0;
          return { str: it.str || "", x, y };
        }).filter(it => it.str && it.str.trim());

        if (!items.length) {
          pageTexts.push("");
          continue;
        }

        // Group into rows by Y coordinate (cluster by rounding)
        const rowsMap = new Map();
        for (const it of items) {
          // Round y to nearest integer to cluster same-line items
          const key = Math.round(it.y);
          if (!rowsMap.has(key)) rowsMap.set(key, []);
          rowsMap.get(key).push(it);
        }

        // Build row objects with left-most x, text and original y
        const rows = Array.from(rowsMap.entries()).map(([yKey, rowItems]) => {
          const sortedRow = rowItems.sort((a, b) => a.x - b.x);
          const text = sortedRow.map(r => r.str).join(" ").trim();
          const left = sortedRow[0]?.x || 0;
          return { y: yKey, left, text };
        }).filter(r => r.text);

        // Cluster rows into columns by their left coordinate (simple spatial clustering)
        rows.sort((a, b) => a.left - b.left);
        const columns = [];
        const COL_GAP = 90; // px threshold to separate columns; tweak as needed
        for (const r of rows) {
          let placed = false;
          for (const col of columns) {
            // if row left is close to column representative, assign
            if (Math.abs(col.x - r.left) < COL_GAP) {
              col.rows.push(r);
              // update representative x to average (keeps cluster stable)
              col.x = (col.x * (col.rows.length - 1) + r.left) / col.rows.length;
              placed = true;
              break;
            }
          }
          if (!placed) {
            columns.push({ x: r.left, rows: [r] });
          }
        }

        // For each column, sort rows top-to-bottom (PDF coords: larger y higher on page => sort desc)
        for (const col of columns) {
          col.rows.sort((a, b) => b.y - a.y);
        }

        // Emit columns left-to-right, each column top-to-bottom.
        // This keeps section headings and their following lines contiguous.
        const colTexts = columns
          .sort((a, b) => a.x - b.x)
          .map(col => col.rows.map(r => r.text).join("\n"))
          .filter(Boolean);

        pageTexts.push(colTexts.join("\n\n")); // put blank line between columns on same page
      }

      // join pages with a clear page-break like gap
      return pageTexts.map(p => p.trim()).filter(Boolean).join("\n\n--- PAGE BREAK ---\n\n").trim();
    } catch (err) {
      console.error("extractWorkHistoryFromPdf error:", err);
      return null;
    }
  };

  // simple html-escape helper
  const escapeHtml = (str = "") => {
    return String(str).replace(/[&<>"']/g, (m) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
  };

  // Convert plain text to safe HTML with preserved whitespace and newlines using <pre>
  const textToHtml = (text = "") => {
    if (text === null || text === undefined) return '<pre style="white-space:pre-wrap;"></pre>';
    return `<pre style="white-space:pre-wrap; font-family:inherit; font-size:inherit;">${escapeHtml(text)}</pre>`;
  };

  // Highlight differences while preserving original whitespace/line breaks.
  // New words in enhanced CV (compared case-insensitively to original) are wrapped in <mark>.
  const buildHighlightedHtml = (orig, enhanced) => {
    if (!enhanced) return textToHtml(orig || "");
    const origWords = (orig || "").match(/\S+/g) || [];
    const origSet = new Set(origWords.map(w => w.replace(/[^\w]/g, "").toLowerCase()));

    // escape enhanced text first to avoid accidental HTML injection
    const escaped = escapeHtml(enhanced);

    // wrap each non-whitespace token if it's not present in original
    const highlighted = escaped.replace(/\S+/g, (token) => {
      const clean = token.replace(/[^\w]/g, "").toLowerCase();
      if (clean && !origSet.has(clean)) {
        return `<mark>${token}</mark>`;
      }
      return token;
    });

    return `<pre style="white-space:pre-wrap; font-family:inherit; font-size:inherit;">${highlighted}</pre>`;
  };

  // Dummy API simulating AI suggestions (replace in production)
  const dummyEnhanceCvApi = async (payload) => {
    await new Promise((r) => setTimeout(r, 700));

    // Return the ENTIRE resume text with AI enhancements applied to action verbs
    // This demonstrates how AI suggestions will be highlighted
    const enhanced = payload.resumeText
      .replace(/\bLed\b/gi, "Successfully led")
      .replace(/\bManaged\b/gi, "Strategically managed")
      .replace(/\bDeveloped\b/gi, "Designed and developed")
      .replace(/\bImproved\b/gi, "Significantly improved")
      .replace(/\bImplemented\b/gi, "Effectively implemented")
      .replace(/\bCollaborated\b/gi, "Actively collaborated")
      .replace(/\bCoordinated\b/gi, "Seamlessly coordinated")
      .replace(/\bCreated\b/gi, "Innovatively created")
      .replace(/\bBuilt\b/gi, "Successfully built")
      .replace(/\bWorked\b/gi, "Actively worked");
    
    const fullResponse = [
      `Enhanced CV for: ${payload.jobTitle}`,
      "",
      "Suggested improvements:",
      "- Tailor bullet points to match job description keywords.",
      "- Quantify achievements where possible.",
      "",
      enhanced
    ].join("\n");
    
    return {
      enhancedCV: fullResponse
    };
  };

  const onRunAI = async () => {
    if (!userProfile?.resume_url) {
      toast.error("Please upload your resume first");
      return;
    }
    setProcessing(true);
    try {
      const payload = {
        resumeText: originalText || "NO_EXTRACTED_TEXT",
        jobDescription: job?.description || "",
        jobTitle: job?.title || "",
        userID: user.id
      };
      const resp = await dummyEnhanceCvApi(payload);
      setEnhancedText(resp.enhancedCV || "");
      const html = buildHighlightedHtml(originalText || "", resp.enhancedCV || "");
      setEditorHtml(html);
      toast.success("AI suggestions ready — edit them in the editor below.");
    } catch (err) {
      console.error("AI call failed:", err);
      toast.error("Failed to get AI suggestions");
    } finally {
      setProcessing(false);
    }
  };

  // convert editor HTML -> plain text preserving line breaks
  const htmlToPlainText = (html = "") => {
    if (typeof document === "undefined") {
      // fallback: very simple strip
      return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/?[^>]+(>|$)/g, "");
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html.replace(/<br\s*\/?>/gi, "\n");
    // textContent will preserve text and pre-formatting line breaks from <pre>
    const text = tmp.textContent || tmp.innerText || "";
    return text.replace(/\u00A0/g, " ");
  };

  // Save editor content as a .docx and upload to Supabase storage 'assets' bucket under enhanced-cvs/
  const saveAsWord = async (htmlContent) => {
    try {
      setProcessing(true);

      const plain = htmlToPlainText(htmlContent || "");
      console.log("Plain text for DOCX:", plain);

      // Build paragraphs
      const rawParagraphs = plain.split(/\n{2,}/);
      const paragraphs = rawParagraphs.map(p => {
        const lines = p.split(/\n/);
        const children = [];

        lines.forEach((line, idx) => {
          children.push(new TextRun(line));
          if (idx < lines.length - 1) {
            children.push(new TextRun({ text: "\n" }));
          }
        });

        return new Paragraph({ children });
      });

      // IMPORTANT: create document with sections
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      console.log("DOCX document built");

      const blob = await Packer.toBlob(doc);
      console.log("DOCX blob created:", blob);

      const fileName = `enhanced-cv-${(job?.title || 'cv').replace(/\s+/g, '-')}-${Date.now()}`;
      const path = `enhanced-cvs/${user.id}/${fileName}.docx`;
      console.log("Uploading to Supabase at path:", path);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("assets")
        .upload(path, blob, {
          contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          upsert: true,
      });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        throw uploadError;
      }
      console.log("Upload success:", uploadData);

      // Get public URL
      const { data: publicData, error: publicError } = await supabase.storage
        .from('assets')
        .getPublicUrl(path);

      if (publicError) {
        console.error("getPublicUrl error:", publicError);
        throw publicError;
      }
      const publicUrl = publicData?.publicUrl || null;

      // Persist metadata in DB
      const { error: dbError } = await supabase
        .from('enhanced_cvs')
        .insert({
          user_id: user.id,
          job_id: job?.id || null,
          file_path: path,
          public_url: publicUrl
        });

      if (dbError) {
        console.error("DB insert error:", dbError);
        throw dbError;
      }

      toast.success("Enhanced CV saved to your account.");

      // Navigate back to job details page after successful save
      // assumes job details route is /jobs/:id
      navigate(`/jobs/${job?.id || jobId}`);
    } catch (err) {
      console.error("saveAsWord error:", err);
      toast.error("Failed to save CV");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
          <p className="text-muted-foreground">Preparing CV enhancer...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Job Details
          </Button>
          <h1 className="text-2xl font-semibold mb-4">CV Enhancer</h1>
          <p className="text-muted-foreground mb-4">Editing suggestions for {job?.title}</p>

          <div className="mb-4">
            <Button className= "px-6 py-3 text-base font-semibold rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300" onClick={onRunAI} disabled={processing || !originalText}>
              {processing ? "Processing…" : "Run AI Suggestions"}
            </Button>
          </div>

          <div className="mb-4">
            <CvEditor
              // show full extracted CV text initially; after AI run, editorHtml will contain highlighted enhanced text
              initialHtml={editorHtml || textToHtml(originalText)}
               onChange={(html) => setEditorHtml(html)}
             />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              className= "px-6 py-3 text-base font-semibold rounded-xl hover:bg-blue-100 hover:text-blue-600 transition-colors duration-300"
              onClick={() => saveAsWord(editorHtml)}
              disabled={processing || !editorHtml}
            >
              {processing ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CVEnhancer;