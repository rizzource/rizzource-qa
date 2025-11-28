// src/components/resume/ResumeEditor.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wand2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import axios from "axios";

const ResumeEditor = () => {
  const { state } = useLocation();
  const file = state?.file;
  const extractedText = state?.extractedText;

  const [resumeSections, setResumeSections] = useState({
    work: [],
    education: [],
    skills: [],
  });

  const [aiModal, setAiModal] = useState({
    open: false,
    type: "improve",
    jobIndex: null,
    bulletIndex: null,
    suggestions: [],
  });

  // ---------------------------
  // 🔥 SIMPLE TEXT PARSER (works well for 80% of resumes)
  // ---------------------------
  const parseResumeText = (text) => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    let work = [];
    let education = [];
    let skills = [];

    let current = null;

    lines.forEach((line) => {
      const lower = line.toLowerCase();

      if (lower.includes("experience") || lower.includes("work history")) {
        current = "work";
        return;
      }
      if (lower.includes("education")) {
        current = "education";
        return;
      }
      if (lower.includes("skills") || lower.includes("technical")) {
        current = "skills";
        return;
      }

      if (current === "work") {
        if (line.startsWith("•") || line.startsWith("-")) {
          const last = work[work.length - 1];
          if (last) last.bullets.push(line.replace(/^[•-]/, "").trim());
        } else {
          work.push({
            title_or_company: line,
            bullets: [],
          });
        }
      }

      if (current === "education") education.push(line);
      if (current === "skills") skills.push(line);
    });

    return { work, education, skills };
  };

  useEffect(() => {
    if (!extractedText) return;
    const parsed = parseResumeText(extractedText);
    setResumeSections(parsed);
  }, [extractedText]);

  // ---------------------------
  // 🔥 AI IMPROVE BULLET
  // ---------------------------
  const improveBullet = async (jobIndex, bulletIndex) => {
    const bullet = resumeSections.work[jobIndex].bullets[bulletIndex];

    try {
      const res = await axios.post("/api/ai/improve-bullet", {
        bulletText: bullet,
      });

      setAiModal({
        open: true,
        type: "improve",
        jobIndex,
        bulletIndex,
        suggestions: res.data.suggestions || [],
      });
    } catch (err) {
      toast.error("AI failed to improve bullet");
    }
  };

  // ---------------------------
  // 🔥 AI ADD NEW BULLET
  // ---------------------------
  const generateNewBullet = async (jobIndex) => {
    const jobTitle = resumeSections.work[jobIndex].title_or_company;

    try {
      const res = await axios.post("/api/ai/generate-bullet", {
        roleTitle: jobTitle,
      });

      setAiModal({
        open: true,
        type: "add",
        jobIndex,
        suggestions: res.data.suggestions || [],
      });
    } catch (err) {
      toast.error("AI failed to generate bullet");
    }
  };

  // ---------------------------
  // 🔥 APPLY AI SUGGESTION
  // ---------------------------
  const applySuggestion = (text) => {
    const updated = { ...resumeSections };

    if (aiModal.type === "improve") {
      updated.work[aiModal.jobIndex].bullets[aiModal.bulletIndex] = text;
    }

    if (aiModal.type === "add") {
      updated.work[aiModal.jobIndex].bullets.push(text);
    }

    setResumeSections(updated);
    setAiModal({ open: false });
    toast.success("Bullet updated!");
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* -----------------------------
              WORK EXPERIENCE
          ------------------------------*/}
          <section>
            <h2 className="text-lg font-semibold mb-3">Work Experience</h2>
            <div className="space-y-4">
              {resumeSections.work.map((job, jIndex) => (
                <Card key={jIndex} className="p-4">
                  <h3 className="text-md font-medium mb-2">
                    {job.title_or_company}
                  </h3>

                  {/* Bullets */}
                  <div className="space-y-2">
                    {job.bullets.map((b, bIndex) => (
                      <div
                        key={bIndex}
                        className="flex items-center gap-3"
                      >
                        <Textarea
                          value={b}
                          onChange={(e) => {
                            const updated = { ...resumeSections };
                            updated.work[jIndex].bullets[bIndex] = e.target.value;
                            setResumeSections(updated);
                          }}
                        />
                        <button
                          onClick={() => improveBullet(jIndex, bIndex)}
                          className="p-2 rounded hover:bg-muted"
                        >
                          <Wand2 className="h-5 w-5 text-primary" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add bullet */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 flex items-center gap-2"
                    onClick={() => generateNewBullet(jIndex)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add bullet with AI
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* -----------------------------
              EDUCATION
          ------------------------------*/}
          <section>
            <h2 className="text-lg font-semibold mb-3">Education</h2>
            {resumeSections.education.map((edu, i) => (
              <Input
                key={i}
                value={edu}
                onChange={(e) => {
                  const updated = { ...resumeSections };
                  updated.education[i] = e.target.value;
                  setResumeSections(updated);
                }}
                className="mb-2"
              />
            ))}
          </section>

          {/* -----------------------------
              SKILLS
          ------------------------------*/}
          <section>
            <h2 className="text-lg font-semibold mb-3">Skills</h2>
            <Textarea
              value={resumeSections.skills.join(", ")}
              onChange={(e) => {
                setResumeSections({
                  ...resumeSections,
                  skills: e.target.value.split(",").map((s) => s.trim()),
                });
              }}
            />
          </section>
        </CardContent>
      </Card>

      {/* -----------------------------
          AI SUGGESTIONS MODAL
      ------------------------------*/}
      <Dialog open={aiModal.open} onOpenChange={() => setAiModal({ open: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Suggestions</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {aiModal.suggestions.map((s, i) => (
              <Card
                key={i}
                className="p-3 cursor-pointer hover:bg-muted"
                onClick={() => applySuggestion(s)}
              >
                {s}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeEditor;
