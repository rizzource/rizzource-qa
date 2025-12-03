import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft,
    Upload,
    FileText,
    Sparkles,
    Download,
    RefreshCw,
    Copy,
    Check,
    Briefcase,
    User,
    Building2,
    Loader2,
    Wand2,
    ChevronDown,
    ChevronRight,
    X,
    FileUp,
    FileCheck,
} from "lucide-react"
import { toast, Toaster } from "sonner"
import {
    generateCoverLetterThunk,
    reGenerateCoverLetterThunk,
    fileUpload
} from "../../redux/slices/userApiSlice"
import { useDispatch } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

/* ---------------------------------------------
   NEW: Convert Parsed Resume Object -> Flat Text
------------------------------------------------*/
const flattenResumeToText = (resume) => {
    if (!resume) return ""

    let out = ""

    // PERSONAL INFO
    if (resume.personalInfo) {
        const p = resume.personalInfo
        out += `${p.name || ""}\n${p.email || ""}\n${p.phone || ""}\n${p.location || ""}\n${p.linkedin || ""}\n\n`
    }

    // SUMMARY
    if (resume.summary) {
        out += `SUMMARY\n${resume.summary}\n\n`
    }

    // EXPERIENCE
    if (resume.experience?.length) {
        out += `EXPERIENCE\n`
        resume.experience.forEach((exp) => {
            out += `${exp.title || ""} — ${exp.company || ""} (${exp.startDate || ""} - ${exp.endDate || ""})\n`
            exp.bullets?.forEach((b) => {
                out += `• ${b.text}\n`
            })
            out += `\n`
        })
    }

    // EDUCATION
    if (resume.education?.length) {
        out += `EDUCATION\n`
        resume.education.forEach((edu) => {
            out += `${edu.degree || ""} — ${edu.school || ""}\n${edu.description || ""}\n\n`
        })
    }

    // SKILLS
    if (resume.skills?.length) {
        out += `SKILLS\n${resume.skills.join(", ")}\n\n`
    }

    return out.trim()
}

const CoverLetterGenerator = ({ onBack, initialResumeText = "", initialJobTitle = "", initialCompany = "" }) => {
    // Resume state
    const location = useLocation();
    const { jobId, title, jobCompany, description } = location.state || {};
    const [resumeText, setResumeText] = useState(initialResumeText)
    const [resumeFile, setResumeFile] = useState(null)
    const [parsing, setParsing] = useState(false)

    const [originalFileUrl, setOriginalFileUrl] = useState("");

    // Mobile screen toggle
    const [mobileView, setMobileView] = useState("editor");

    // Job details
    const [jobTitle, setJobTitle] = useState(title || "")
    const [company, setCompany] = useState(jobCompany || "")
    const [jobDescription, setJobDescription] = useState(description || "")

    // Cover letter state
    const [coverLetter, setCoverLetter] = useState("")
    const [generating, setGenerating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [letterName, setLetterName] = useState("Cover Letter")

    // Tone options
    const [selectedTone, setSelectedTone] = useState("professional")
    const tones = [
        { id: "professional", label: "Professional" },
        { id: "enthusiastic", label: "Enthusiastic" },
        { id: "confident", label: "Confident" },
        { id: "friendly", label: "Friendly" },
    ]

    const [sectionsOpen, setSectionsOpen] = useState({
        resume: true,
        job: true,
        tone: false,
    })

    const fileInputRef = useRef(null)
    const previewRef = useRef(null)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [typingIndex, setTypingIndex] = useState(0);
    useEffect(() => {
        if (!parsing) return;

        let i = 0;

        const interval = setInterval(() => {
            i++;
            if (i >= 5) {
                clearInterval(interval);
                return;
            }
            setTypingIndex(i);
        }, 4000); // 3 sec per message, total 15 sec

        return () => clearInterval(interval);
    }, [parsing]);


    const toggleSection = (section) => {
        setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    /* ---------------------------------------------------
       REAL RESUMEEDITOR UPLOAD LOGIC (DROP-IN EXACT)
       --------------------------------------------------- */

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const valid = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]

        if (!valid.includes(file.type)) {
            toast.error("Please upload PDF or DOCX")
            return
        }

        setResumeFile(file)
        setParsing(true)

        dispatch(fileUpload({ file }))
            .unwrap()
            .then((data) => {
                if (data.resume) {
                    setResumeText(flattenResumeToText(data.resume))
                } else if (data.resumeText) {
                    setResumeText(data.resumeText)
                }

                setOriginalFileUrl(data.fileUrl)
                setParsing(false)
                toast.success("Resume parsed successfully!")
            })
            .catch(() => {
                setParsing(false)
                toast.error("Failed to parse resume")
            })
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (!file) return

        const valid = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ]

        if (!valid.includes(file.type)) {
            toast.error("Please upload PDF or DOCX")
            return
        }

        setResumeFile(file)
        setParsing(true)

        dispatch(fileUpload({ file }))
            .unwrap()
            .then((data) => {
                if (data.resume) {
                    setResumeText(flattenResumeToText(data.resume))
                } else if (data.resumeText) {
                    setResumeText(data.resumeText)
                }

                setOriginalFileUrl(data.fileUrl)
                setParsing(false)
                toast.success("Resume parsed successfully!")
            })
            .catch(() => {
                setParsing(false)
                toast.error("Failed to parse resume")
            })
    }

    /* ---------------------------------------------------
       GENERATION LOGIC (UNCHANGED)
       --------------------------------------------------- */

    const generateCoverLetter = async () => {
        if (!resumeText.trim()) return toast.error("Upload or paste your resume first")
        if (!jobDescription.trim()) return toast.error("Enter job description")

        setGenerating(true)

        const result = await dispatch(
            generateCoverLetterThunk({
                resumeText,
                jobDescription,
                jobTitle,
                company,
                selectedTone
            })
        )

        setGenerating(false)

        if (result.meta.requestStatus === "fulfilled") {
            setCoverLetter(result.payload.coverLetter)
            toast.success("Cover letter generated!")
            setMobileView("preview")
        } else {
            toast.error("Failed to generate")
        }
    }

    const regenerateCoverLetter = async () => {
        setGenerating(true)

        const result = await dispatch(
            reGenerateCoverLetterThunk({
                resumeText,
                jobDescription,
                jobTitle,
                company,
                selectedTone
            })
        )

        setGenerating(false)

        if (result.meta.requestStatus === "fulfilled") {
            setCoverLetter(result.payload.coverLetter)
            toast.success("Cover letter updated!")
            setMobileView("preview");
        } else {
            toast.error("Failed to regenerate")
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(coverLetter)
        setCopied(true)
        toast.success("Copied!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExportPDF = () => {
        if (!coverLetter) return toast.error("Generate a cover letter first")

        window.html2pdf().from(previewRef.current).save()
    }

    /* ---------------------------------------------------
       FULL JSX BELOW — Only upload section changed
       --------------------------------------------------- */

    return (
        <div className="min-h-screen bg-background flex flex-col" style={{ marginTop: 60 }}>
            <Toaster richColors closeButton position="top-center" />
            {/* Mobile Toggle Bar */}
            <div className="md:hidden sticky top-[60px] z-20 bg-background border-b">
                <div className="flex">
                    <button
                        className={`flex-1 py-3 text-center text-sm font-medium ${mobileView === "editor"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground"
                            }`}
                        onClick={() => setMobileView("editor")}
                    >
                        Editor
                    </button>

                    <button
                        className={`flex-1 py-3 text-center text-sm font-medium ${mobileView === "preview"
                            ? "border-b-2 border-primary text-primary"
                            : "text-muted-foreground"
                            }`}
                        onClick={() => setMobileView("preview")}
                    >
                        Preview
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden md:flex-row flex-col">
                {/* LEFT PANEL */}
                <div
                    className={`${mobileView === "editor" ? "block" : "hidden"} md:block md:w-1/2 flex flex-col border-r`}
                >
                    {/* Header */}
                    <div className="p-4 border-b bg-card flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${jobId}`)}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Button>
                        {resumeFile && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {resumeFile.name}
                            </Badge>
                        )}
                    </div>

                    {/* Scrollable Form */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 md:space-y-4">

                        {/* -------------------------------- */}
                        {/* RESUME UPLOAD SECTION (UPDATED) */}
                        {/* -------------------------------- */}
                        <Card>
                            <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("resume")}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {sectionsOpen.resume ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                        <User className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base">Your Resume</CardTitle>
                                    </div>
                                    {resumeText && (
                                        <Badge variant="outline" className="text-xs">Ready</Badge>
                                    )}
                                </div>
                            </CardHeader>

                            {sectionsOpen.resume && (
                                <CardContent className="space-y-4">
                                    {!resumeText ? (
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${parsing
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary hover:bg-secondary/50 hover:shadow-lg"
                                                }`}
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                accept=".pdf,.docx"
                                                className="hidden"
                                            />

                                            {parsing ? (
                                                <div className="flex flex-col items-center gap-8 py-12">

                                                    {/* AI ORB */}
                                                    <div className="relative">
                                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                                            <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                                        </div>
                                                    </div>

                                                    {/* ANIMATED TEXT SECTION */}
                                                    <div className="flex flex-col items-center gap-2">
                                                        <p className="text-lg font-semibold text-primary/90">
                                                            AI is analyzing your resume
                                                        </p>

                                                        {/* Typing text with fade */}
                                                        <p
                                                            key={typingIndex} // forces fade animation on change
                                                            className="text-base font-medium animate-fade text-center
                   overflow-hidden whitespace-nowrap border-r-4 
                   border-primary pr-2 animate-typing"
                                                        >
                                                            {[
                                                                "Reading your resume...",
                                                                "Detecting Experience...",
                                                                "Extracting Skills...",
                                                                "Fixing inconsistencies...",
                                                                "Preparing structured data..."
                                                            ][typingIndex]}
                                                        </p>
                                                    </div>

                                                    <p className="text-muted-foreground text-sm">
                                                        Hang tight — this usually takes ~20 seconds.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-5">
                                                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                                                        <FileUp className="h-10 w-10 text-primary" />
                                                    </div>
                                                    <p className="font-medium">Drop your resume here or click to browse</p>
                                                    <div className="flex gap-3">
                                                        <Badge variant="outline" className="px-3 py-1 flex items-center gap-1.5">
                                                            <FileCheck className="h-3.5 w-3.5 text-red-500" /> PDF
                                                        </Badge>
                                                        <Badge variant="outline" className="px-3 py-1 flex items-center gap-1.5">
                                                            <FileCheck className="h-3.5 w-3.5 text-blue-500" /> DOCX
                                                        </Badge>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">Resume content loaded</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setResumeText("")
                                                        setResumeFile(null)
                                                    }}
                                                >
                                                    <X className="h-4 w-4 mr-1" /> Clear
                                                </Button>
                                            </div>

                                            <Textarea
                                                value={resumeText}
                                                onChange={(e) => setResumeText(e.target.value)}
                                                className="min-h-[150px] text-sm font-mono"
                                                placeholder="Or paste your resume here..."
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>

                        {/* JOB DETAILS */}
                        <Card>
                            <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("job")}>
                                <div className="flex items-center gap-2">
                                    {sectionsOpen.job ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <Briefcase className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Job Details</CardTitle>
                                </div>
                            </CardHeader>

                            {sectionsOpen.job && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">Job Title</label>
                                            <Input
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium">Company</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    className="pl-10"
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium">Job Description *</label>
                                        <Textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            className="min-h-[180px]"
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* TONE SELECTION */}
                        <Card>
                            <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("tone")}>
                                <div className="flex items-center gap-2">
                                    {sectionsOpen.tone ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <Wand2 className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-base">Writing Tone</CardTitle>
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                        {tones.find((t) => t.id === selectedTone)?.label}
                                    </Badge>
                                </div>
                            </CardHeader>

                            {sectionsOpen.tone && (
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {tones.map((tone) => (
                                            <Button
                                                key={tone.id}
                                                variant={selectedTone === tone.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setSelectedTone(tone.id)}
                                                className="rounded-full"
                                            >
                                                {tone.label}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* GENERATE BUTTON */}
                        <Button
                            size="lg"
                            className="w-full py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-accent to-primary text-white shadow-md hover:scale-[1.02] transition-all duration-300"
                            onClick={coverLetter ? regenerateCoverLetter : generateCoverLetter}
                            disabled={generating}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : coverLetter ? (
                                <>
                                    <RefreshCw className="h-5 w-5 mr-2" />
                                    Regenerate Cover Letter
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Generate Cover Letter
                                </>
                            )}
                        </Button>

                    </div>
                </div>

                {/* RIGHT PANEL – PREVIEW */}
                <div
                    className={`${mobileView === "preview" ? "block" : "hidden"} md:block md:w-1/2 flex flex-col bg-muted/30`}
                >
                    <div className="p-4 border-b bg-card flex items-center justify-between">
                        <span className="font-semibold">Live Preview</span>
                        <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!coverLetter}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                        <Badge variant="outline" className="text-xs">Auto-updating</Badge>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-2xl mx-auto">
                            {!coverLetter ? (
                                <div className="bg-white rounded-lg shadow-sm border p-12 text-center min-h-[600px] flex flex-col items-center justify-center">
                                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground">Your cover letter will appear here</p>
                                    <p className="text-sm text-muted-foreground mt-2">Fill in your resume and job details, then click generate</p>
                                </div>
                            ) : (
                                <div ref={previewRef} className="bg-white rounded-lg shadow-sm border p-8 min-h-[600px]">
                                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                        {coverLetter}
                                    </pre>
                                </div>
                            )}

                            {coverLetter && (
                                <div className="mt-4 flex justify-center gap-3">
                                    <Button variant="outline" size="sm" onClick={handleCopy}>
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" /> Copy to Clipboard
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default CoverLetterGenerator
