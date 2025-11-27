import { useState } from 'react';

import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

const ResumeUpload = ({ onUploadComplete }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          resume_url: publicUrl,
          resume_file_name: file.name,
          resume_uploaded_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Resume uploaded successfully!');
      setResumeUrl(publicUrl);
      if (onUploadComplete) onUploadComplete(publicUrl);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!resumeUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setUploading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          resume_url: resumeUrl,
          resume_file_name: 'External Resume',
          resume_uploaded_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Resume URL saved successfully!');
      if (onUploadComplete) onUploadComplete(resumeUrl);
    } catch (error) {
      console.error('Error saving resume URL:', error);
      toast.error('Failed to save resume URL. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
        <div>
          <label htmlFor="resume-file" className="block text-sm font-medium mb-2">
            Upload File (PDF or Word)
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="resume-file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <div>
          <label htmlFor="resume-url" className="block text-sm font-medium mb-2">
            Provide Resume URL
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="resume-url"
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
          <p className="text-sm text-muted-foreground text-center">
            Uploading...
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ResumeUpload;
