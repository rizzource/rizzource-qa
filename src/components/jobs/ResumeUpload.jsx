// src/components/jobs/ResumeUpload.jsx
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { toast } from "sonner";

import * as pdfjsLib from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

const ResumeUpload = ({ onUploadComplete }) => {
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  // -----------------------------
  // Extract text from PDF
  // -----------------------------
  const extractPdfText = async (arrayBuffer) => {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it) => it.str || "");
      text += strings.join(" ") + "\n";
    }

    return text.trim();
  };

  // -----------------------------
  // Extract text from DOC / DOCX
  // (Simple fallback parser)
  // -----------------------------
  const extractDocText = async (file) => {
    const raw = await file.text();
    return raw.trim().slice(0, 8000);
  };

  // -----------------------------
  // Handle file upload
  // -----------------------------
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        extractedText = await extractPdfText(buffer);
      } else {
        extractedText = await extractDocText(file);
      }

      if (!extractedText || extractedText.length < 20) {
        toast.error("Could not extract readable text from resume");
        setUploading(false);
        return;
      }

      onUploadComplete(file, extractedText);

      navigate("/resume/editor", {
        state: { file, extractedText },
      });

      toast.success("Resume uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to process resume");
    } finally {
      setUploading(false);
    }
  };

  // -----------------------------
  // Handle URL mode
  // -----------------------------
  const handleUrlSubmit = () => {
    if (!resumeUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    onUploadComplete(resumeUrl, "");
    toast.success("Resume URL saved");
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Your Resume
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          You need to upload your resume before applying for jobs
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload File */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload File (PDF or Word)
          </label>

          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Provide Resume URL</label>
          <div className="flex items-center gap-2">
            <Input
              type="url"
              placeholder="https://drive.google.com/your-resume"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              disabled={uploading}
              className="flex-1"
            />

            <Button
              onClick={handleUrlSubmit}
              disabled={uploading || !resumeUrl.trim()}
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>

        {uploading && (
          <p className="text-sm text-muted-foreground text-center">Uploading...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
