import { useState, useRef } from "react"
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
} from "lucide-react"
import { toast } from "sonner"
import { generateCoverLetterThunk, reGenerateCoverLetterThunk } from "../../redux/slices/userApiSlice"
import { useDispatch } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"

const CoverLetterGenerator = ({ onBack, initialResumeText = "", initialJobTitle = "", initialCompany = "" }) => {
    // Resume state
    const [resumeText, setResumeText] = useState(initialResumeText)
    const [resumeFile, setResumeFile] = useState(null)
    const [parsing, setParsing] = useState(false)
    // Mobile screen toggle: 'editor' | 'preview'
    const [mobileView, setMobileView] = useState("editor");

    // Job details state
    const [jobTitle, setJobTitle] = useState(initialJobTitle)
    const [company, setCompany] = useState(initialCompany)
    const [jobDescription, setJobDescription] = useState("")

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

    // Section collapse states
    const [sectionsOpen, setSectionsOpen] = useState({
        resume: true,
        job: true,
        tone: false,
    })

    const fileInputRef = useRef(null)
    const previewRef = useRef(null)

    const toggleSection = (section) => {
        setSectionsOpen((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    // Mock resume parsing
    const parseResume = async (file) => {
        setParsing(true)
        await new Promise((r) => setTimeout(r, 1500))
        setParsing(false)

        // Mock extracted text
        const mockText = `John Smith
Software Engineer with 5+ years of experience in full-stack development.

EXPERIENCE
Senior Software Engineer at Tech Corp (2021-Present)
- Led development of microservices architecture serving 1M+ users
- Mentored team of 4 junior developers
- Implemented CI/CD pipelines reducing deployment time by 60%

Software Engineer at StartupXYZ (2019-2021)
- Built React-based dashboard for real-time analytics
- Developed REST APIs using Node.js and Express
- Collaborated with design team on UI/UX improvements

EDUCATION
B.S. Computer Science, State University (2019)

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, PostgreSQL`

        setResumeText(mockText)
        toast.success("Resume parsed successfully")
    }

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PDF or DOCX file")
            return
        }

        setResumeFile(file)
        parseResume(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) {
            const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
            if (!validTypes.includes(file.type)) {
                toast.error("Please upload a PDF or DOCX file")
                return
            }
            setResumeFile(file)
            parseResume(file)
        }
    }

    // Mock AI generation
    const dispatch = useDispatch();
    const generateCoverLetter = async () => {
        if (!resumeText.trim()) return toast.error("Please upload or paste your resume first");
        if (!jobDescription.trim()) return toast.error("Please enter a job description");

        setGenerating(true);

        const result = await dispatch(
            generateCoverLetterThunk({
                resumeText,
                jobDescription,
                jobTitle,
                company,
                selectedTone
            })
        );

        setGenerating(false);

        if (result.meta.requestStatus === "fulfilled") {
            setCoverLetter(result.payload.coverLetter);
            toast.success("Cover letter generated!");
        } else {
            toast.error("Failed to generate cover letter");
        }
    };


    const regenerateCoverLetter = async () => {
        setGenerating(true);

        const result = await dispatch(
            reGenerateCoverLetterThunk({
                resumeText,
                jobDescription,
                jobTitle,
                company,
                selectedTone
            })
        );

        setGenerating(false);

        if (result.meta.requestStatus === "fulfilled") {
            setCoverLetter(result.payload.coverLetter);
            toast.success("Cover letter regenerated!");
        } else {
            toast.error("Failed to regenerate");
        }
    };


    const handleCopy = async () => {
        await navigator.clipboard.writeText(coverLetter)
        setCopied(true)
        toast.success("Copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const handleExportPDF = async () => {
        if (!coverLetter) {
            toast.error("Generate a cover letter first")
            return
        }

        toast.success("Preparing PDF...")

        const html2pdf = (await import("html2pdf.js")).default
        const element = previewRef.current

        const opt = {
            margin: [0.75, 0.75, 0.75, 0.75],
            filename: `${letterName.replace(/\s+/g, "_")}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        }

        html2pdf().set(opt).from(element).save()
    }
    const navigate = useNavigate();
    const location = useLocation();
    const { jobId } = location.state || {};
    return (<>

        <div className="min-h-screen bg-background flex flex-col" style={{ marginTop: 60 }}>
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

            {/* Main split view */}
            <div className="flex-1 flex overflow-hidden md:flex-row flex-col">
                {/* Left Panel - Editor */}
                <div
                    className={`
        flex flex-col border-r
        ${mobileView === "editor" ? "block" : "hidden"}
        md:block md:w-1/2
    `}
                >

                    {/* Editor Header */}
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

                    {/* Editor Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 md:space-y-4">

                        {/* Resume Section */}
                        <Card>
                            <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("resume")}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {sectionsOpen.resume ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        <User className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-base">Your Resume</CardTitle>
                                    </div>
                                    {resumeText && (
                                        <Badge variant="outline" className="text-xs">
                                            Ready
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            {sectionsOpen.resume && (
                                <CardContent className="space-y-4">
                                    {!resumeText ? (
                                        <div
                                            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-secondary/50 transition-colors"
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                accept=".pdf,.docx"
                                                className="hidden"
                                            />
                                            {parsing ? (
                                                <div className="space-y-3">
                                                    <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin" />
                                                    <p className="text-muted-foreground">Parsing resume...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                                    <p className="font-medium">Drop your resume here or click to browse</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Supports PDF, DOCX</p>
                                                </>
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
                                                placeholder="Or paste your resume text here..."
                                            />
                                        </div>
                                    )}
                                    {!resumeText && !parsing && (
                                        <div className="text-center">
                                            <p className="text-sm text-muted-foreground mb-2">Or paste your resume content directly</p>
                                            <Textarea
                                                value={resumeText}
                                                onChange={(e) => setResumeText(e.target.value)}
                                                className="min-h-[100px] text-sm"
                                                placeholder="Paste your resume text here..."
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>

                        {/* Job Details Section */}
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
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Job Title</label>
                                            <Input
                                                value={jobTitle}
                                                onChange={(e) => setJobTitle(e.target.value)}
                                                placeholder="e.g. Software Engineer"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Company</label>
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    value={company}
                                                    onChange={(e) => setCompany(e.target.value)}
                                                    placeholder="e.g. Google"
                                                    className="pl-10"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Job Description *</label>
                                        <Textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the full job description here. The more detail, the better the cover letter..."
                                            className="min-h-[180px]"
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* Tone Selection */}
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

                        {/* Generate Button */}
                        <Button
                            size="lg"
                            className="w-full py-6 text-base font-semibold rounded-xl bg-gradient-to-r from-accent to-primary text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
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

                {/* Right Panel - Preview */}
                <div
                    className={`
        flex flex-col bg-muted/30
        ${mobileView === "preview" ? "block" : "hidden"}
        md:block md:w-1/2
    `}
                >

                    {/* Preview Header */}
                    <div className="p-4 border-b bg-card flex items-center justify-between">
                        <span className="font-semibold">Live Preview</span>
                        <div className="flex items-center gap-2">
                            {/* <FileText className="h-4 w-4 text-muted-foreground" /> */}
                            {/* <Input value={letterName} onChange={(e) => setLetterName(e.target.value)} className="w-40 h-8 text-sm" /> */}
                            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={!coverLetter}>
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                            </Button>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            Auto-updating
                        </Badge>
                    </div>

                    {/* Preview Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="max-w-2xl mx-auto">
                            {!coverLetter ? (
                                <div className="bg-white rounded-lg shadow-sm border p-12 text-center min-h-[600px] flex flex-col items-center justify-center">
                                    <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                                    <p className="text-lg font-medium text-muted-foreground">Your cover letter will appear here</p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Fill in your resume and job details, then click generate
                                    </p>
                                </div>
                            ) : (
                                <div ref={previewRef} className="bg-white rounded-lg shadow-sm border p-8 min-h-[600px]">
                                    {/* Letter Content */}
                                    <div className="prose prose-sm max-w-none">
                                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                                            {coverLetter}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {/* Actions below preview */}
                            {coverLetter && (
                                <div className="mt-4 flex justify-center gap-3">
                                    <Button variant="outline" size="sm" onClick={handleCopy}>
                                        {copied ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy to Clipboard
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

    </>
    )
}

export default CoverLetterGenerator
