import { useState, useRef, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/AuthProvider";
import { toast } from "react-toastify";

const OutlinesUpload = ({ onUploadSuccess }) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const { user } = useAuth();
  const [mentorData, setMentorData] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    professor: "",
    topic: "",
    year: "",
    file: null
  });
  const [uploadStatus, setUploadStatus] = useState(null); 
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem("mentorFormData");
    if (storedData) {
      console.log("Loaded mentor data from session storage:", storedData);
      setMentorData(JSON.parse(storedData));
    }
  }, []);

  const topics = ["Constitutional Law", "Contracts", "Criminal Law", "Torts", "Civil Procedure", "Property Law", "Administrative Law", "Evidence", "Tax Law", "Corporate Law", "Employment Law", "Environmental Law", "Leg Reg", "Family Law I & II", "Law and Economy", "Business Associations"];
  const years = ["1L", "2L", "3L"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (file) => {
    console.log("File selected:", file);

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    ];
    if (!allowedTypes.includes(file.type)) {
      console.error("Invalid file type:", file.type);
      setUploadStatus("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) { // <-- updated to 10MB
      console.error("File too large:", file.size);
      setUploadStatus("error");
      return;
    }

    setFormData(prev => ({
      ...prev,
      file: file
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log("File dropped:", e.dataTransfer.files[0]);
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeFile = () => {
    console.log("Removing file:", formData.file?.name);
    setFormData(prev => ({
      ...prev,
      file: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMentorFlow = async (outlineData) => {
    console.log("Starting mentor flow with data:", outlineData);

    if (!mentorData) {
      toast.error("Mentor information not found. Please start over.");
      navigate("/mentorship-selection");
      return;
    }

    try {
      const { error: mentorError } = await supabase
        .from("mentors")
        .update({ had_uploaded_outline: true })
        .eq("email", mentorData.email);

      if (mentorError) {
        console.error("Mentor update error:", mentorError);
        throw mentorError;
      }

      const { error: outlineError } = await supabase
        .from("outlines")
        .update({ mentor_email: mentorData.email })
        .eq("id", outlineData.id);

      if (outlineError) {
        console.error("Error updating outline with mentor email:", outlineError);
      }

      sessionStorage.removeItem("mentorFormData");
      toast.success("Your mentor application and outline have been submitted successfully.");

      setTimeout(() => {
        navigate("/matchup", { 
          state: { 
            mentorName: `Mentor`,
            activity: mentorData.meetupHow || "coffee",
            meetupTime: mentorData.meetupWhen || "3pm, Tuesday 12th Sep, 2025",
            location: "Campus Café"
          } 
        });
      }, 1500);

    } catch (error) {
      console.error("Error in mentor flow:", error);
      toast.error("There was an error completing your registration. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus("uploading");

    console.log("Submitting outline with formData:", formData);
    console.log("Current user:", user);

    if (!user) {
      toast.error("Please log in to upload outlines.");
      setUploadStatus(null);
      return;
    }

    try {
      const fileExt = formData.file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `outlines/${user.id}/${fileName}`;

      console.log("File type:", formData.file, typeof formData.file);
      console.log("Uploading file to storage path:", filePath);

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("assets")
          .upload(filePath, formData.file, { upsert: true });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw uploadError;
        }

        console.log("Storage upload success:", uploadData);
      } catch (error) {
        console.error("Unexpected error during storage upload:", error);
      }

      const { data: { publicUrl } } = supabase.storage
        .from("assets")
        .getPublicUrl(filePath);

      console.log("Public URL obtained:", publicUrl);

      const { data: outlineData, error: dbError } = await supabase
        .from("outlines")
        .insert([{
          title: formData.title,
          professor: formData.professor,
          topic: formData.topic,
          year: formData.year,
          file_name: formData.file.name,
          file_url: publicUrl,
          file_size: formData.file.size,
          file_type: formData.file.type,
          user_id: user.id,
        }])
        .select()
        .single();

      if (dbError) {
        console.error("Database insert error:", dbError);
        throw dbError;
      }
      console.log("Database insert success:", outlineData);

      setUploadStatus("success");
      toast.success("Your outline has been uploaded successfully.");

      if (mentorData) {
        await handleMentorFlow(outlineData);
      } else {
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error("Upload error caught:", error);
      setUploadStatus("error");
      toast.error(`Upload Failed: ${error.message}`);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const isFormValid = formData.title && formData.professor && formData.topic && formData.year && formData.file;

  return (
    <div className="max-w-2xl mx-auto">
      
      <Card className="bg-card backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload Your Outline
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Share your study materials with fellow law students. Help others succeed while building your academic reputation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Guidelines */}
          <Alert className="border-accent/30 bg-accent/10">
            <AlertCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-primary">
              <strong>Upload Guidelines:</strong> Please ensure your outline is your original work or properly attributed. 
              Accepted formats: PDF, DOCX. Maximum file size: 10MB.
            </AlertDescription>
          </Alert>

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <Alert className="border-accent/30 bg-accent/10">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-primary">
                <strong>Upload Successful!</strong> Your outline has been submitted for review and will be available shortly.
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert className="border-destructive/30 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-primary">
                <strong>Upload Error:</strong> Please check that your file is a PDF or DOCX under 10MB.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title" className="text-primary">Outline Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Constitutional Law Comprehensive Outline"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
                    required
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="professor" className="text-primary">Professor *</Label>
                    <Input
                      id="professor"
                      placeholder="e.g., Professor Smith"
                      value={formData.professor}
                      onChange={(e) => handleInputChange('professor', e.target.value)}
                      className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
                      required
                    />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-primary">Topic *</Label>
                  <Select value={formData.topic} onValueChange={(value) => handleInputChange('topic', value)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border shadow-lg z-50">
                      {topics.map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-primary">
                    Year *
                  </Label>
                  <input
                    id="year"
                    type="text"
                    value={formData.year}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits and max 4 characters
                      if (/^\d{0,4}$/.test(value)) {
                        handleInputChange("year", value);
                      }
                    }}
                    placeholder="Enter year (e.g. 2025)"
                    className="bg-card border border-border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={4} // ensures only 4 characters
                  />
                </div>


                {/* <div className="space-y-2">
                  <Label htmlFor="tags" className="text-primary">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., Due Process, Equal Protection (separate with commas)"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>
              </div> */}

              {/* <div className="space-y-2">
                <Label htmlFor="notes" className="text-primary">Notes *</Label>
                <Textarea
                  id="notes"
                  placeholder="Provide detailed notes about your outline. Describe what topics it covers, study strategies used, key cases included, and what makes it useful for other students. (500-1000 words recommended)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent min-h-[200px] resize-y"
                  required
                />
                <div className="text-sm text-muted-foreground text-right">
                  {formData.notes.length}/1000 characters
                </div>
              </div> */}
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">File Upload</h3>
              
              <div className="space-y-2">
                <Label htmlFor="file" className="text-primary">Outline File *</Label>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    dragActive 
                      ? 'border-accent bg-accent/10' 
                      : formData.file 
                        ? 'border-accent bg-accent/5' 
                        : 'border-border hover:border-accent/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="file"
                    accept=".pdf,.docx"
                    onChange={handleFileInputChange}
                    className="hidden"
                    required
                  />
                  
                  {formData.file ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <FileText className="w-12 h-12 text-accent" />
                        </div>
                      <div className="space-y-1">
                        <p className="text-primary font-medium">{formData.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="border-primary text-primary hover:bg-primary/10"
                        >
                          Replace File
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="file" className="cursor-pointer block">
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <Upload className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-primary font-medium">
                            {dragActive ? 'Drop your file here' : 'Drag & drop your outline or click to browse'}
                          </p>
                          <p className="text-sm text-muted-foreground">PDF or DOCX files up to 10MB</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || uploadStatus === 'uploading'}
                className="disabled:opacity-50"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <div className="animate-spin rounded-full h-12 border-b-2 border-primary mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-12 mr-2" />
                    Upload Outline
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutlinesUpload;