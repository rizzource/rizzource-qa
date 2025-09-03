import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OutlinesUpload = () => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    professor: "",
    topic: "",
    year: "",
    tags: "",
    notes: "",
    file: null
  });
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'
  const [dragActive, setDragActive] = useState(false);

  const topics = ["Constitutional Law", "Contracts", "Criminal Law", "Torts", "Civil Procedure", "Property Law", "Administrative Law", "Evidence", "Tax Law", "Corporate Law", "Employment Law", "Environmental Law"];
  const years = ["1L", "2L", "3L"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (file) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('error');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('error');
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
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
      ...prev,
      file: null
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      setUploadStatus('success');
      // Reset form after success
      setTimeout(() => {
        setFormData({
          title: "",
          professor: "",
          topic: "",
          year: "",
          tags: "",
          notes: "",
          file: null
        });
        setUploadStatus(null);
      }, 3000);
    }, 2000);
  };

  const isFormValid = formData.title && formData.professor && formData.topic && formData.year && formData.notes && formData.file;

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-primary">Year Level *</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border shadow-lg z-50">
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-primary">Tags (Optional)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., Due Process, Equal Protection (separate with commas)"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="bg-card border-border focus:border-accent focus:ring-2 focus:ring-accent"
                    />
                </div>
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="notes" className="text-primary">Notes *</Label>
                <Textarea
                  id="notes"
                  placeholder="Provide detailed notes about your outline. Describe what topics it covers, study strategies used, key cases included, and what makes it useful for other students. (500-1000 words recommended)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-white border-border/50 focus:border-light-green min-h-[200px] resize-y"
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