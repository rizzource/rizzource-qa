import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const OutlinesUpload = () => {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    year: "",
    description: "",
    tags: "",
    file: null
  });
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'

  const subjects = ["Constitutional Law", "Contracts", "Criminal Law", "Torts", "Civil Procedure", "Property Law", "Administrative Law", "Evidence"];
  const years = ["1L", "2L", "3L"];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
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
          subject: "",
          year: "",
          description: "",
          tags: "",
          file: null
        });
        setUploadStatus(null);
      }, 3000);
    }, 2000);
  };

  const isFormValid = formData.title && formData.subject && formData.year && formData.description && formData.file;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-white/95 backdrop-blur-sm border-white/20">
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
          <Alert className="border-gold-light/30 bg-gold-light/10">
            <AlertCircle className="h-4 w-4 text-gold-dark" />
            <AlertDescription className="text-primary">
              <strong>Upload Guidelines:</strong> Please ensure your outline is your original work or properly attributed. 
              Accepted formats: PDF, DOC, DOCX. Maximum file size: 10MB.
            </AlertDescription>
          </Alert>

          {/* Upload Status */}
          {uploadStatus === 'success' && (
            <Alert className="border-light-green/30 bg-light-green/10">
              <CheckCircle className="h-4 w-4 text-light-green" />
              <AlertDescription className="text-primary">
                <strong>Upload Successful!</strong> Your outline has been submitted for review and will be available shortly.
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
                  className="bg-white border-border/50 focus:border-light-green"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-primary">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger className="bg-white border-border/50">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-primary">Year Level *</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                    <SelectTrigger className="bg-white border-border/50">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-border/50 shadow-lg z-50">
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-primary">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Briefly describe your outline, what topics it covers, and what makes it useful..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="bg-white border-border/50 focus:border-light-green min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-primary">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., Due Process, Equal Protection, Judicial Review (separate with commas)"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  className="bg-white border-border/50 focus:border-light-green"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">File Upload</h3>
              
              <div className="space-y-2">
                <Label htmlFor="file" className="text-primary">Outline File *</Label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center hover:border-light-green/50 transition-colors">
                  <input
                    type="file"
                    id="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    required
                  />
                  <label htmlFor="file" className="cursor-pointer">
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
                      {formData.file ? (
                        <div>
                          <p className="text-primary font-medium">{formData.file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-primary">Click to upload your outline</p>
                          <p className="text-sm text-muted-foreground">PDF, DOC, or DOCX files up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={!isFormValid || uploadStatus === 'uploading'}
                className="w-full bg-gold-light text-primary hover:bg-gold-dark disabled:opacity-50"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
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