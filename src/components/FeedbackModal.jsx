import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, Send, Sparkles, CheckCircle2, X } from "lucide-react"
import { toast } from "sonner"
import { useDispatch, useSelector } from "react-redux"
import { submitFeedbackThunk } from "../redux/slices/userApiSlice"
import { track } from "@/lib/analytics"

const FeedbackModal = ({
    isOpen,
    onClose,
    feedbackType,
    title = "How was your experience?",
    description = "Your feedback helps us improve our service"
}) => {
    const dispatch = useDispatch()
    const { user } = useSelector(
        (state) => state.userApi
    );

    const [selectedFeedback, setSelectedFeedback] = useState(null)
    const [additionalComments, setAdditionalComments] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    // Debug logging
    useEffect(() => {
        console.log("FeedbackModal isOpen:", isOpen)
    }, [isOpen])

    const handleFeedbackSelect = (feedback) => {
        setSelectedFeedback(feedback)
        track("Feedback_Selected", {
            feedbackType,
            feedback
        })
    }

    const handleSubmit = async () => {
        if (!selectedFeedback) {
            toast.error("Please select thumbs up or down")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await dispatch(
                submitFeedbackThunk({
                    userId: user?.id,
                    userFeedback: selectedFeedback,
                    feedbackType,
                    comments: additionalComments.trim() || undefined
                })
            )

            if (result.meta.requestStatus === "fulfilled") {
                setSubmitted(true)
                track("Feedback_Submitted", {
                    feedbackType,
                    feedback: selectedFeedback,
                    hasComments: !!additionalComments.trim()
                })

                // Auto-close after showing success state
                setTimeout(() => {
                    handleClose()
                }, 2000)
            } else {
                toast.error("Failed to submit feedback")
                track("Feedback_Failed", {
                    feedbackType,
                    feedback: selectedFeedback
                })
            }
        } catch (error) {
            toast.error("Something went wrong")
            track("Feedback_Error", {
                feedbackType,
                error: error.message
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setSelectedFeedback(null)
        setAdditionalComments("")
        setSubmitted(false)
        onClose()
    }

    // Don't render if not open
    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[500px] p-4">
                <div className="bg-white rounded-lg shadow-xl animate-in zoom-in-95 fade-in duration-200">
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>

                    {!submitted ? (
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                    {title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>

                            {/* Thumbs Up/Down Selection */}
                            <div className="flex gap-4 justify-center mb-6">
                                <button
                                    onClick={() => handleFeedbackSelect("thumb-up")}
                                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${selectedFeedback === "thumb-up"
                                            ? "border-green-500 bg-green-50 shadow-lg"
                                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                                        }`}
                                >
                                    <div
                                        className={`p-4 rounded-full transition-colors ${selectedFeedback === "thumb-up"
                                                ? "bg-green-500"
                                                : "bg-gray-100"
                                            }`}
                                    >
                                        <ThumbsUp
                                            className={`h-8 w-8 ${selectedFeedback === "thumb-up"
                                                    ? "text-white"
                                                    : "text-gray-400"
                                                }`}
                                        />
                                    </div>
                                    <span
                                        className={`font-medium ${selectedFeedback === "thumb-up"
                                                ? "text-green-700"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        Great!
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleFeedbackSelect("thumb-down")}
                                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${selectedFeedback === "thumb-down"
                                            ? "border-red-500 bg-red-50 shadow-lg"
                                            : "border-gray-200 hover:border-red-300 hover:bg-red-50/50"
                                        }`}
                                >
                                    <div
                                        className={`p-4 rounded-full transition-colors ${selectedFeedback === "thumb-down"
                                                ? "bg-red-500"
                                                : "bg-gray-100"
                                            }`}
                                    >
                                        <ThumbsDown
                                            className={`h-8 w-8 ${selectedFeedback === "thumb-down"
                                                    ? "text-white"
                                                    : "text-gray-400"
                                                }`}
                                        />
                                    </div>
                                    <span
                                        className={`font-medium ${selectedFeedback === "thumb-down"
                                                ? "text-red-700"
                                                : "text-gray-600"
                                            }`}
                                    >
                                        Needs Work
                                    </span>
                                </button>
                            </div>

                            {/* Optional Comments */}
                            {selectedFeedback && (
                                <div className="space-y-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <label className="text-sm font-medium text-gray-700">
                                        Additional comments (optional)
                                    </label>
                                    <Textarea
                                        value={additionalComments}
                                        onChange={(e) => setAdditionalComments(e.target.value)}
                                        placeholder="Tell us more about your experience..."
                                        className="min-h-[100px] resize-none"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                    disabled={isSubmitting}
                                >
                                    Skip
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!selectedFeedback || isSubmitting}
                                    className="flex-1"
                                >
                                    {isSubmitting ? (
                                        <>Submitting...</>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Feedback
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 px-6 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                            <div className="p-4 rounded-full bg-green-100">
                                <CheckCircle2 className="h-12 w-12 text-green-600" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-semibold">Thank you!</h3>
                                <p className="text-muted-foreground">
                                    Your feedback helps us improve
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default FeedbackModal