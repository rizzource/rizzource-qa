"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { track } from "@/lib/analytics"
import {
    ArrowLeft,
    Upload,
    FileText,
    Wand2,
    Plus,
    Check,
    RefreshCw,
    Loader2,
    GripVertical,
    Trash2,
    ChevronDown,
    ChevronUp,
    Briefcase,
    GraduationCap,
    User,
    Award,
    X,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Download,
    Sparkles,
    Shield,
    Zap,
    FileCheck,
    FileUp,
    Brain,
} from "lucide-react"
import { toast, Toaster } from "sonner"
import { fileUpload, generateNewBulletThunk, improveBulletThunk } from "../../redux/slices/userApiSlice"
import { useDispatch } from "react-redux"
import { buildResumeHtml } from "../../lib/utils"
import FeedbackModal from "../FeedbackModal"

// File parser mock - in real implementation, use a library like pdf-parse or mammoth
const parseResumeFile = async (file) => {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock parsed data - replace with actual parsing logic
    return {
        personalInfo: {
            name: "John Doe",
            email: "john.doe@email.com",
            phone: "(555) 123-4567",
            location: "San Francisco, CA",
            linkedin: "linkedin.com/in/johndoe",
        },
        summary:
            "Results-driven professional with 5+ years of experience in software development and project management. Proven track record of delivering high-impact projects and leading cross-functional teams.",
        experience: [
            {
                id: "exp-1",
                title: "Senior Software Engineer",
                company: "Tech Company Inc.",
                location: "San Francisco, CA",
                startDate: "Jan 2021",
                endDate: "Present",
                bullets: [
                    { id: "b1", text: "Led development of microservices architecture serving 1M+ daily users" },
                    { id: "b2", text: "Managed team of 4 junior developers and conducted code reviews" },
                    { id: "b3", text: "Improved application performance by 40% through optimization" },
                ],
            },
            {
                id: "exp-2",
                title: "Software Engineer",
                company: "Startup Labs",
                location: "Austin, TX",
                startDate: "Jun 2018",
                endDate: "Dec 2020",
                bullets: [
                    { id: "b4", text: "Developed RESTful APIs using Node.js and Express" },
                    { id: "b5", text: "Implemented CI/CD pipelines reducing deployment time by 60%" },
                ],
            },
        ],
        education: [
            {
                id: "edu-1",
                degree: "Bachelor of Science in Computer Science",
                school: "University of California",
                location: "Berkeley, CA",
                startDate: "Sep 2014",
                endDate: "May 2018",
                description: "GPA: 3.8/4.0, Dean's List",
            },
        ],
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
    }
}

// Live Preview Component
const ResumePreview = ({ resumeData }) => {
    if (!resumeData) return null

    return (
        <div className="bg-white text-black p-8 min-h-full font-serif text-sm leading-relaxed">
            {/* Header */}
            <div className="text-center border-b border-gray-300 pb-4 mb-4">
                <h1 className="text-2xl font-bold tracking-wide uppercase mb-2">
                    {resumeData.personalInfo.name || "Your Name"}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    {resumeData.personalInfo.email && (
                        <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {resumeData.personalInfo.email}
                        </span>
                    )}
                    {resumeData.personalInfo.phone && (
                        <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {resumeData.personalInfo.phone}
                        </span>
                    )}
                    {resumeData.personalInfo.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {resumeData.personalInfo.location}
                        </span>
                    )}
                    {resumeData.personalInfo.linkedin && (
                        <span className="flex items-center gap-1">
                            <Linkedin className="h-3 w-3" />
                            {resumeData.personalInfo.linkedin}
                        </span>
                    )}
                </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
                        Professional Summary
                    </h2>
                    <p className="text-xs text-gray-700 leading-relaxed">{resumeData.summary}</p>
                </div>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">
                        Work Experience
                    </h2>
                    <div className="space-y-3">
                        {resumeData.experience.map((exp) => (
                            <div key={exp.id}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-xs">{exp.title || "Job Title"}</h3>
                                    <span className="text-xs text-gray-500">
                                        {exp.startDate} - {exp.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline text-xs text-gray-600 mb-1">
                                    <span>{exp.company || "Company Name"}</span>
                                    <span>{exp.location}</span>
                                </div>
                                <ul className="list-disc list-outside ml-4 space-y-0.5">
                                    {exp.bullets.map((bullet) => (
                                        <li key={bullet.id} className="text-xs text-gray-700">
                                            {bullet.text || "Bullet point..."}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
                <div className="mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Education</h2>
                    <div className="space-y-2">
                        {resumeData.education.map((edu) => (
                            <div key={edu.id}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="font-bold text-xs">{edu.degree || "Degree"}</h3>
                                    <span className="text-xs text-gray-500">
                                        {edu.startDate} - {edu.endDate}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline text-xs text-gray-600">
                                    <span>{edu.school || "School Name"}</span>
                                    <span>{edu.location}</span>
                                </div>
                                {edu.description && <p className="text-xs text-gray-500 mt-0.5">{edu.description}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {resumeData.skills.length > 0 && (
                <div>
                    <h2 className="text-xs font-bold uppercase tracking-widest border-b border-gray-300 pb-1 mb-2">Skills</h2>
                    <p className="text-xs text-gray-700">{resumeData.skills.join(" • ")}</p>
                </div>
            )}
        </div>
    )
}

const ResumeEditor = ({ onBack, initialFile = null, initialExtractedText = "" }) => {
    // Upload state
    const [uploadedFile, setUploadedFile] = useState(initialFile)
    const [isParsing, setIsParsing] = useState(false)
    // Mobile responsive mode toggle
    const [mobileView, setMobileView] = useState("editor"); // 'editor' | 'preview'

    const fileInputRef = useRef(null)
    // Skill Modal State
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    // Resume data state
    const [resumeData, setResumeData] = useState(null)
    const [originalFileUrl, setOriginalFileUrl] = useState('');
    // AI enhancement state (enhance existing bullet)
    const [activeEnhanceBulletId, setActiveEnhanceBulletId] = useState(null)
    const [enhanceAiSuggestions, setEnhanceAiSuggestions] = useState([]);
    const [isGeneratingEnhance, setIsGeneratingEnhance] = useState(false)

    // AI add-bullet state (generate new bullets)
    const [showNewBulletAIExpId, setShowNewBulletAIExpId] = useState(null)
    const [addAiSuggestions, setAddAiSuggestions] = useState([]);
    const [isGeneratingAdd, setIsGeneratingAdd] = useState(false)

    // Section collapse state
    const [collapsedSections, setCollapsedSections] = useState({})
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const dispatch = useDispatch();
    const [typingIndex, setTypingIndex] = useState(0);
    useEffect(() => {
        if (!isParsing) return;

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
    }, [isParsing]);


    const generateAIBullets = async (bulletText, jobTitle) => {
        const result = await dispatch(
            improveBulletThunk({
                bulletText,
                jobTitle
            })
        );

        if (result.meta.requestStatus === "fulfilled") {
            return result.payload.improvements;
        } else {
            toast.error("Failed to improve bullet");
            return [];
        }
    };


    const generateNewBullet = async (jobTitle, company) => {
        const result = await dispatch(
            generateNewBulletThunk({
                jobTitle,
                company
            })
        );

        if (result.meta.requestStatus === "fulfilled") {
            return result.payload.newBullets;
        } else {
            toast.error("Could not generate bullet");
            return [];
        }
    };

    const BASE_URL =
        "https://rizzource-c2amh0adhpcbgjgx.canadacentral-01.azurewebsites.net/api";
    // Handle file upload
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const validTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PDF or DOCX file")
            return
        }
        track("ResumeUpload", {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

        setUploadedFile(file)
        setIsParsing(true);
        dispatch(fileUpload({ file }))
            .unwrap()
            .then((data) => {
                // data = { resume, fileUrl }
                setResumeData(data.resume);
                setOriginalFileUrl(data.fileUrl);
                setIsParsing(false);
                track("ResumeParsed", {
                    success: true,
                    resumeSections: Object.keys(data.resume || {})
                });
                toast.success("Resume parsed successfully!");
            })
            .catch((err) => {
                setIsParsing(false);
                track("ResumeParsed", { success: false });
                toast.error(err || "Failed to parse resume");
            });

    }


    const onDownloadPdf = () => {
        const htmlString = buildResumeHtml(resumeData);

        // Create a temporary DOM container
        const element = document.createElement("div");
        element.innerHTML = htmlString;

        const opt = {
            margin: 0.5,
            filename: "Resume.pdf",
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
        };

        window.html2pdf().from(element).save();
        toast.success("PDF downloaded successfully!")
        setTimeout(() => {
            setShowFeedbackModal(true)
        }, 1000)
        track("ResumeDownloaded", {
            sectionCount: Object.keys(resumeData || {}).length
        });

    };

    const handleDrop = useCallback(async (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (!file) return

        const validTypes = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PDF or DOCX file")
            return
        }
        track("ResumeUpload", {
            method: "drag-drop",
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

        setUploadedFile(file)
        setIsParsing(true);
        dispatch(fileUpload({ file }))
            .unwrap()
            .then((data) => {
                // data = { resume, fileUrl }
                setResumeData(data.resume);
                setOriginalFileUrl(data.fileUrl);
                setIsParsing(false);
                toast.success("Resume parsed successfully!");
                track("ResumeParsed", {
                    success: true,
                    parsedFrom: "drag-drop"
                });

            })
            .catch((err) => {
                setIsParsing(false);
                toast.error(err || "Failed to parse resume");
                track("AIBulletImproveStarted", {
                    bulletId,
                    expId,
                    bulletLength: bulletText.length
                });

            });
    }, [])


    // AI Bullet Enhancement
    const handleEnhanceBullet = async (expId, bulletId, bulletText) => {
        const exp = resumeData?.experience.find((e) => e.id === expId)
        if (!exp) return

        setActiveEnhanceBulletId(bulletId)
        setIsGeneratingEnhance(true)
        setEnhanceAiSuggestions([])
        track("AIBulletImproveStarted", {
            bulletId,
            expId,
            bulletLength: bulletText.length
        });

        try {
            const suggestions = await generateAIBullets(bulletText, exp.title)
            setEnhanceAiSuggestions(
                suggestions
                    .filter(text => /^\d+\.\s*".*"$/.test(text))
                    .map((text, i) => ({
                        id: `sug-${i}`,
                        text: text
                            .replace(/^\d+\.\s*/, "") // remove "1. "
                            .replace(/^"|"$|^"+|"+$/g, "") // remove surrounding quotes
                    }))
            );
            track("AIBulletImproveCompleted", {
                count: suggestions.length
            });

        } catch (error) {
            toast.error("Failed to generate suggestions")
            track("AIBulletImproveFailed");
        } finally {
            setIsGeneratingEnhance(false)
        }
    }

    const handleRegenerateSuggestions = async () => {
        if (!activeEnhanceBulletId || !resumeData) return

        const exp = resumeData.experience.find((e) => e.bullets.some((b) => b.id === activeEnhanceBulletId))
        const bullet = exp?.bullets.find((b) => b.id === activeEnhanceBulletId)
        if (!exp || !bullet) return
        track("AIRegenerateSuggestions", {
            bulletId: activeEnhanceBulletId
        });

        setIsGeneratingEnhance(true)
        try {
            const suggestions = await generateAIBullets(bullet.text, exp.title)
            setEnhanceAiSuggestions(
                suggestions
                    .filter(text => /^\d+\.\s*".*"$/.test(text))
                    .map((text, i) => ({
                        id: `sug-${i}`,
                        text: text
                            .replace(/^\d+\.\s*/, "") // remove "1. "
                            .replace(/^"|"$|^"+|"+$/g, "") // remove surrounding quotes
                    }))
            );
        } catch (error) {
            toast.error("Failed to regenerate suggestions")
        } finally {
            setIsGeneratingEnhance(false)
        }
    }

    const handleUseSuggestion = (expId, bulletId, newText) => {
        if (!resumeData) return
        track("AIBulletSuggestionUsed", {
            expId,
            bulletId
        });

        setResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp) =>
                exp.id === expId
                    ? {
                        ...exp,
                        bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, text: newText } : b)),
                    }
                    : exp,
            ),
        })
        setActiveEnhanceBulletId(null)
        setEnhanceAiSuggestions([])
        toast.success("Bullet updated!")
    }

    // Add new bullet with AI
    const handleAddBulletWithAI = async (expId) => {
        const exp = resumeData?.experience.find((e) => e.id === expId)
        if (exp?.length == 0) return;

        setShowNewBulletAIExpId(expId)
        setIsGeneratingAdd(true)
        setAddAiSuggestions([])
        track("AIAddBulletStarted", { expId });

        try {
            const suggestions = await generateNewBullet(exp.title, exp.company)
            const filteredSuggestions = suggestions.map((text, i) => ({
                id: `sug-${i}`,
                text: text
                    .replace(/^-+\s*/, "") // remove "- " or "-- " etc.
            }));
            setAddAiSuggestions(
                filteredSuggestions
            );
            track("AIAddBulletCompleted", {
                count: suggestions.length
            });

        } catch (error) {
            toast.error("Failed to generate bullet suggestions")
            track("AIAddBulletFailed");
        } finally {
            setIsGeneratingAdd(false)
        }
    }

    const handleAddGeneratedBullet = (expId, text) => {
        if (!resumeData) return

        const newBullet = {
            id: `b-${Date.now()}`,
            text,
        }
        track("AIBulletAdded", {
            expId,
            length: text.length
        });

        setResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp) =>
                exp.id === expId ? { ...exp, bullets: [...exp.bullets, newBullet] } : exp,
            ),
        })
        setShowNewBulletAIExpId(null)
        setAddAiSuggestions([])
        toast.success("Bullet added!")
    }

    // Manual bullet operations
    const handleAddManualBullet = (expId) => {
        if (!resumeData) return
        track("ManualBulletAdded", { expId });

        const newBullet = {
            id: `b-${Date.now()}`,
            text: "",
        }

        setResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp) =>
                exp.id === expId ? { ...exp, bullets: [...exp.bullets, newBullet] } : exp,
            ),
        })
    }

    const handleUpdateBullet = (expId, bulletId, text) => {
        if (!resumeData) return
        track("ManualBulletEdited", {
            expId,
            bulletId,
            newLength: text.length
        });
        setResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp) =>
                exp.id === expId
                    ? {
                        ...exp,
                        bullets: exp.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)),
                    }
                    : exp,
            ),
        })
    }

    const handleDeleteBullet = (expId, bulletId) => {
        if (!resumeData) return
        track("ManualBulletDeleted", { expId, bulletId });
        setResumeData({
            ...resumeData,
            experience: resumeData.experience.map((exp) =>
                exp.id === expId ? { ...exp, bullets: exp.bullets.filter((b) => b.id !== bulletId) } : exp,
            ),
        })
        toast.success("Bullet removed")
    }

    // Section toggle
    const toggleSection = (sectionId) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }))
        track("ResumeSectionToggled", {
            section: sectionId,
            collapsed: !collapsedSections[sectionId]
        });

    }

    // Upload Screen
    if (!resumeData) {
        return (
            <div className="min-h-screen bg-background">
                <Toaster richColors closeButton position="top-center" />
                <div className="container mx-auto px-4 py-8 max-w-2xl">
                    <Button variant="ghost" onClick={() => onBack()} className="mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>

                    <Card>
                        <CardHeader className="text-center pb-2">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">Upload Your Resume</CardTitle>
                            <p className="text-muted-foreground mt-2">Upload a PDF or DOCX file to enhance your resume with AI</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div
                                className={`
                  border-2 border-dashed rounded-xl p-10 text-center
                  transition-all duration-300 cursor-pointer
                  ${isParsing
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-primary hover:bg-secondary/50 hover:shadow-lg"
                                    }
                `}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {isParsing ? (
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
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileUp className="h-10 w-10 text-primary" />
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                                <Upload className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold">Drop your resume here or click to browse</p>
                                            <p className="text-muted-foreground text-sm mt-1">
                                                We'll parse and structure your content automatically
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1.5">
                                                <FileCheck className="h-3.5 w-3.5 text-red-500" />
                                                PDF
                                            </Badge>
                                            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1.5">
                                                <FileCheck className="h-3.5 w-3.5 text-blue-500" />
                                                DOCX
                                            </Badge>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/30">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <p className="text-sm font-medium">AI-Powered</p>
                                    <p className="text-xs text-muted-foreground mt-1">Enhance bullets with AI</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/30">
                                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-2">
                                        <Shield className="h-5 w-5 text-green-500" />
                                    </div>
                                    <p className="text-sm font-medium">Secure</p>
                                    <p className="text-xs text-muted-foreground mt-1">Your data stays private</p>
                                </div>
                                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/30">
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                                        <Zap className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <p className="text-sm font-medium">Instant</p>
                                    <p className="text-xs text-muted-foreground mt-1">Results in seconds</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // Main Editor with Side-by-Side Preview
    return (
        <div className="min-h-screen bg-background" style={{ marginTop: 70 }}>
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                feedbackType="resume"
                title="How was your experience?"
                description="Your feedback helps us create better resumes for everyone"
            />
            <Toaster richColors closeButton position="top-center" />
            {/* Header */}
            {/* <div className="border-b bg-background sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        
                    </div>
                </div>
            </div> */}

            {/* Main Content - Split View */}
            {/* Mobile Toggle Bar */}
            <div className="md:hidden sticky top-[73px] z-20 bg-background border-b">
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

            <div className="flex h-[calc(100vh-73px)] md:flex-row flex-col">
                {/* Left Panel - Editor */}
                <div
                    className={`
        border-r overflow-hidden
        ${mobileView === "editor" ? "block" : "hidden"}
        md:block md:w-1/2
    `}
                >

                    <ScrollArea className="h-full">
                        <div className="p-6 space-y-8 md:space-y-6">

                            {/* Personal Info Section */}
                            {/* <div className="flex items-center gap-4"> */}
                            {/* {onBack && ( */}
                            <Button variant="ghost" onClick={() => setResumeData(false)} size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Back
                            </Button>
                            {/* )} */}
                            {/* </div> */}
                            <Card>
                                <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("personal")}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <User className="h-5 w-5 text-primary" />
                                            Personal Information
                                        </CardTitle>
                                        {collapsedSections["personal"] ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {!collapsedSections["personal"] && (
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                                <Input
                                                    value={resumeData.personalInfo.name}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            personalInfo: {
                                                                ...resumeData.personalInfo,
                                                                name: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                                <Input
                                                    value={resumeData.personalInfo.email}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            personalInfo: {
                                                                ...resumeData.personalInfo,
                                                                email: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                                <Input
                                                    value={resumeData.personalInfo.phone}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            personalInfo: {
                                                                ...resumeData.personalInfo,
                                                                phone: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                                <Input
                                                    value={resumeData.personalInfo.location}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            personalInfo: {
                                                                ...resumeData.personalInfo,
                                                                location: e.target.value,
                                                            },
                                                        })
                                                    }
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">LinkedIn</label>
                                            <Input
                                                value={resumeData.personalInfo.linkedin}
                                                onChange={(e) =>
                                                    setResumeData({
                                                        ...resumeData,
                                                        personalInfo: {
                                                            ...resumeData.personalInfo,
                                                            linkedin: e.target.value,
                                                        },
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </CardContent>
                                )}
                            </Card>

                            {/* Summary Section */}
                            <Card>
                                <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("summary")}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            Professional Summary
                                        </CardTitle>
                                        {collapsedSections["summary"] ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {!collapsedSections["summary"] && (
                                    <CardContent className="pt-0">
                                        <Textarea
                                            value={resumeData.summary}
                                            onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                                            rows={3}
                                            className="resize-none"
                                        />
                                    </CardContent>
                                )}
                            </Card>

                            {/* Work Experience Section */}
                            <Card>
                                <CardHeader className="py-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-primary" />
                                        Work Experience
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-0">
                                    {resumeData.experience.map((exp) => (
                                        <div key={exp.id} className="border rounded-xl p-4 space-y-3 bg-secondary/30">
                                            {/* Experience Header */}
                                            <div className="space-y-2">
                                                <Input
                                                    value={exp.title}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            experience: resumeData.experience.map((ex) =>
                                                                ex.id === exp.id ? { ...ex, title: e.target.value } : ex,
                                                            ),
                                                        })
                                                    }
                                                    className="font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                                                    placeholder="Job Title"
                                                />
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Input
                                                        value={exp.company}
                                                        onChange={(e) =>
                                                            setResumeData({
                                                                ...resumeData,
                                                                experience: resumeData.experience.map((ex) =>
                                                                    ex.id === exp.id ? { ...ex, company: e.target.value } : ex,
                                                                ),
                                                            })
                                                        }
                                                        className="border-none bg-transparent p-0 h-auto focus-visible:ring-0 w-auto text-sm"
                                                        placeholder="Company"
                                                    />
                                                    <span>•</span>
                                                    <span className="text-xs">
                                                        {exp.startDate} - {exp.endDate}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bullets */}
                                            <div className="space-y-4 md:space-y-2">
                                                {exp.bullets.map((bullet) => (
                                                    <div key={bullet.id} className="group relative">
                                                        <div className="flex items-start gap-2">
                                                            <GripVertical className="h-4 w-4 mt-2 text-muted-foreground/50 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                                            <div className="flex-1 relative">
                                                                <Textarea
                                                                    value={bullet.text}
                                                                    onChange={(e) => handleUpdateBullet(exp.id, bullet.id, e.target.value)}
                                                                    className="resize-none min-h-[50px] pr-16 text-sm"
                                                                    rows={2}
                                                                />
                                                                {/* Action buttons on hover */}
                                                                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 hover:bg-primary hover:text-primary-foreground"
                                                                        onClick={() => handleEnhanceBullet(exp.id, bullet.id, bullet.text)}
                                                                        title="Improve with AI"
                                                                    >
                                                                        <Wand2 className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                                        onClick={() => handleDeleteBullet(exp.id, bullet.id)}
                                                                        title="Delete bullet"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* AI Suggestions Panel (enhance existing bullet) */}
                                                        {activeEnhanceBulletId === bullet.id && (
                                                            <div className="mt-2 ml-6 p-3 border rounded-xl bg-background space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Wand2 className="h-4 w-4 text-primary" />
                                                                        <span className="font-medium text-sm">AI Suggestions</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={handleRegenerateSuggestions}
                                                                            disabled={isGeneratingEnhance}
                                                                            className="h-7 text-xs"
                                                                        >
                                                                            {isGeneratingEnhance ? (
                                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                            ) : (
                                                                                <RefreshCw className="h-3 w-3" />
                                                                            )}
                                                                            <span className="ml-1">Regenerate</span>
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setActiveEnhanceBulletId(null)
                                                                                setEnhanceAiSuggestions([])
                                                                            }}
                                                                            className="h-7 w-7 p-0"
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {isGeneratingEnhance ? (
                                                                    <div className="flex items-center justify-center py-4">
                                                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                                        <span className="ml-2 text-muted-foreground text-sm">Generating...</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-2">
                                                                        {enhanceAiSuggestions.map((suggestion) => (
                                                                            <div
                                                                                key={suggestion.id}
                                                                                className="flex items-start gap-2 p-2 rounded-lg border hover:bg-secondary/50 transition-colors group/suggestion"
                                                                            >
                                                                                <p className="flex-1 text-xs">{suggestion.text}</p>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="h-6 text-xs opacity-0 group-hover/suggestion:opacity-100 transition-opacity bg-transparent shrink-0"
                                                                                    onClick={() => handleUseSuggestion(exp.id, bullet.id, suggestion.text)}
                                                                                >
                                                                                    <Check className="h-3 w-3 mr-1" />
                                                                                    Use
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Bullet Actions */}
                                            <div className="flex items-center gap-2 pt-1 ml-5">
                                                {/* <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddManualBullet(exp.id)}
                                                    className="text-xs h-6"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Bullet
                                                </Button> */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddBulletWithAI(exp.id)}
                                                    className="text-xs h-6 relative overflow-hidden group px-3 font-semibold rounded-lg
                                   bg-gradient-to-r from-accent to-primary text-primary-foreground shadow-sm
                                   transition-all duration-300 ease-out hover:shadow-md hover:scale-105"
                                                >
                                                    <Wand2 className="h-3 w-3 mr-1" />
                                                    Write with AI
                                                </Button>
                                            </div>

                                            {/* New Bullet AI Panel (add new bullets) */}
                                            {showNewBulletAIExpId === exp.id && (
                                                <div className="p-3 border rounded-xl bg-background space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Wand2 className="h-4 w-4 text-primary" />
                                                            <span className="font-medium text-sm">AI Generated Bullets</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleAddBulletWithAI(exp.id)}
                                                                disabled={isGeneratingAdd}
                                                                className="h-7 text-xs"
                                                            >
                                                                {isGeneratingAdd ? (
                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="h-3 w-3" />
                                                                )}
                                                                <span className="ml-1">Regenerate</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setShowNewBulletAIExpId(null)
                                                                    setAddAiSuggestions([])
                                                                }}
                                                                className="h-7 w-7 p-0"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {isGeneratingAdd ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                            <span className="ml-2 text-muted-foreground text-sm">Generating new bullets...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {addAiSuggestions.map((suggestion) => (
                                                                <div
                                                                    key={suggestion.id}
                                                                    className="flex items-start gap-2 p-2 rounded-lg border hover:bg-secondary/50 transition-colors group/suggestion"
                                                                >
                                                                    <p className="flex-1 text-xs">{suggestion.text}</p>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-6 text-xs opacity-0 group-hover/suggestion:opacity-100 transition-opacity bg-transparent shrink-0"
                                                                        onClick={() => handleAddGeneratedBullet(exp.id, suggestion.text)}
                                                                    >
                                                                        <Check className="h-3 w-3 mr-1" />
                                                                        Use
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Education Section */}
                            <Card>
                                <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("education")}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5 text-primary" />
                                            Education
                                        </CardTitle>
                                        {collapsedSections["education"] ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {!collapsedSections["education"] && (
                                    <CardContent className="space-y-3 pt-0">
                                        {resumeData.education.map((edu) => (
                                            <div key={edu.id} className="border rounded-xl p-3 space-y-2 bg-secondary/30">
                                                <Input
                                                    value={edu.degree}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            education: resumeData.education.map((ed) =>
                                                                ed.id === edu.id ? { ...ed, degree: e.target.value } : ed,
                                                            ),
                                                        })
                                                    }
                                                    className="font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-0 text-sm"
                                                    placeholder="Degree"
                                                />
                                                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                    <span>{edu.school}</span>
                                                    <span>•</span>
                                                    <span>
                                                        {edu.startDate} - {edu.endDate}
                                                    </span>
                                                </div>
                                                <Input
                                                    value={edu.description}
                                                    onChange={(e) =>
                                                        setResumeData({
                                                            ...resumeData,
                                                            education: resumeData.education.map((ed) =>
                                                                ed.id === edu.id ? { ...ed, description: e.target.value } : ed,
                                                            ),
                                                        })
                                                    }
                                                    className="text-xs text-muted-foreground border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                                                    placeholder="Additional details..."
                                                />
                                            </div>
                                        ))}
                                    </CardContent>
                                )}
                            </Card>

                            {/* Skills Section */}
                            <Card>
                                <CardHeader className="cursor-pointer py-3" onClick={() => toggleSection("skills")}>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            Skills
                                        </CardTitle>
                                        {collapsedSections["skills"] ? (
                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                        ) : (
                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                        )}
                                    </div>
                                </CardHeader>
                                {!collapsedSections["skills"] && (
                                    <CardContent className="pt-0">
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs py-1 px-2">
                                                    {skill}
                                                    <button
                                                        className="ml-1 hover:text-destructive"
                                                        onClick={() =>
                                                            setResumeData({
                                                                ...resumeData,
                                                                skills: resumeData.skills.filter((_, i) => i !== index),
                                                            })
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </Badge>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 text-xs bg-transparent"
                                                onClick={() => setIsSkillModalOpen(true)}

                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add
                                            </Button>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Panel - Live Preview */}
                <div
                    className={`
        bg-muted/30 overflow-hidden
        ${mobileView === "preview" ? "block" : "hidden"}
        md:block md:w-1/2
    `}
                >

                    <div className="h-full flex flex-col">
                        <div className="p-3 border-b bg-background flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Live Preview</span>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    {uploadedFile?.name}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => onDownloadPdf()}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export PDF
                                </Button>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                Auto-updating
                            </Badge>
                        </div>
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <div
                                    className="bg-white shadow-lg rounded-lg overflow-hidden mx-auto"
                                    style={{ maxWidth: "8.5in", aspectRatio: "8.5/11" }}
                                >
                                    <ResumePreview resumeData={resumeData} />
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                    {/* Add Skill Modal */}
                    {isSkillModalOpen && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-xl space-y-4">
                                <h2 className="text-lg font-semibold">Add a Skill</h2>

                                <Input
                                    placeholder="Enter skill..."
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                />

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setIsSkillModalOpen(false)}>
                                        Cancel
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            if (newSkill.trim()) {
                                                setResumeData({
                                                    ...resumeData,
                                                    skills: [...resumeData.skills, newSkill.trim()],
                                                });
                                                setNewSkill("");
                                                setIsSkillModalOpen(false);
                                            }
                                        }}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

export default ResumeEditor
