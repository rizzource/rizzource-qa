import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  professor: z.string().min(1, "Professor name is required").max(100, "Professor name must be less than 100 characters"),
  topic: z.string().min(1, "Topic is required"),
  year: z.string().min(1, "Year is required"),
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
  tags: z.string().optional(),
});

const OutlinesUpload = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      professor: "",
      topic: "",
      year: "",
      notes: "",
      tags: "",
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please select a valid file type (PDF, DOC, DOCX, or TXT)');
        return;
      }

      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
    }
  };

  const onSubmit = async (data) => {
    if (!user) {
      toast.error('You must be logged in to upload outlines');
      return;
    }

    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `outlines/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      // Process tags
      const tagsArray = data.tags ? 
        data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
        [];

      // Insert outline record
      const { error: dbError } = await supabase
        .from('outlines')
        .insert({
          user_id: user.id,
          title: data.title,
          professor: data.professor,
          topic: data.topic,
          year: data.year,
          notes: data.notes || null,
          tags: tagsArray,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        });

      if (dbError) throw dbError;

      toast.success('Outline uploaded successfully!');
      setUploadSuccess(true);
      form.reset();
      setFile(null);

      // Reset success state after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error) {
      console.error('Error uploading outline:', error);
      toast.error('Failed to upload outline. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="text-center py-12">
          <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/70 text-lg mb-2">Authentication Required</p>
          <p className="text-white/50">Please log in to upload outlines</p>
        </CardContent>
      </Card>
    );
  }

  if (uploadSuccess) {
    return (
      <Card className="bg-white/10 border-white/20">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Upload Successful!</p>
          <p className="text-white/70">Your outline has been added to the database</p>
          <Button 
            onClick={() => setUploadSuccess(false)} 
            className="mt-4 bg-gold-primary hover:bg-gold-primary/90 text-primary-green"
          >
            Upload Another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Upload New Outline</CardTitle>
        <CardDescription className="text-white/70">
          Share your outline with fellow law students
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Constitutional Law I - Fundamentals"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="professor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Professor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Professor Smith"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Topic</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Constitutional Law">Constitutional Law</SelectItem>
                        <SelectItem value="Contracts">Contracts</SelectItem>
                        <SelectItem value="Torts">Torts</SelectItem>
                        <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                        <SelectItem value="Civil Procedure">Civil Procedure</SelectItem>
                        <SelectItem value="Evidence">Evidence</SelectItem>
                        <SelectItem value="Administrative Law">Administrative Law</SelectItem>
                        <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                        <SelectItem value="Federal Courts">Federal Courts</SelectItem>
                        <SelectItem value="Tax Law">Tax Law</SelectItem>
                        <SelectItem value="Employment Law">Employment Law</SelectItem>
                        <SelectItem value="Property Law">Property Law</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1L">1L</SelectItem>
                        <SelectItem value="2L">2L</SelectItem>
                        <SelectItem value="3L">3L</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Tags (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., constitutional law, civil rights, federalism (separate with commas)"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">
                    Notes (optional)
                    <span className="text-white/50 text-sm ml-2">
                      {field.value?.length || 0}/1000 characters
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the content, key cases covered, study tips, etc..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60 min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <Label className="text-white mb-2 block">Upload File</Label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-white/40 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-white/60 mx-auto mb-2" />
                  <p className="text-white/70">
                    {file ? file.name : 'Click to select a file or drag and drop'}
                  </p>
                  <p className="text-white/50 text-sm mt-1">
                    Supported formats: PDF, DOC, DOCX, TXT (max 10MB)
                  </p>
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={uploading}
              className="w-full bg-gold-primary hover:bg-gold-primary/90 text-primary-green font-medium"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-green mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Outline
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OutlinesUpload;