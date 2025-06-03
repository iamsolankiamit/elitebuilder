'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Github, FileText, Video } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubmission, useUpdateSubmission } from '@/hooks/use-challenges';
import type { CreateSubmissionDto } from '@/lib/types';

export default function EditSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = parseInt(params.id as string);
  
  const { data: submission, isLoading } = useSubmission(submissionId);
  const updateSubmissionMutation = useUpdateSubmission();
  
  const [formData, setFormData] = useState<CreateSubmissionDto>({
    repoUrl: '',
    pitchDeck: '',
    demoVideo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (submission) {
      setFormData({
        repoUrl: submission.repoUrl,
        pitchDeck: submission.pitchDeck,
        demoVideo: submission.demoVideo,
      });
    }
  }, [submission]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.repoUrl.trim()) {
      newErrors.repoUrl = 'Repository URL is required';
    } else if (!isValidUrl(formData.repoUrl)) {
      newErrors.repoUrl = 'Please enter a valid URL';
    }

    if (!formData.pitchDeck.trim()) {
      newErrors.pitchDeck = 'Pitch deck URL is required';
    } else if (!isValidUrl(formData.pitchDeck)) {
      newErrors.pitchDeck = 'Please enter a valid URL';
    }

    if (!formData.demoVideo.trim()) {
      newErrors.demoVideo = 'Demo video URL is required';
    } else if (!isValidUrl(formData.demoVideo)) {
      newErrors.demoVideo = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updateSubmissionMutation.mutateAsync({
        id: submissionId,
        data: formData,
      });
      router.push(`/submissions/${submissionId}`);
    } catch (error) {
      console.error('Failed to update submission:', error);
    }
  };

  const handleChange = (field: keyof CreateSubmissionDto) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Submission Not Found</h1>
            <p className="text-muted-foreground mb-4">The submission you are looking for does not exist.</p>
            <Button asChild>
              <Link href="/submissions">Back to Submissions</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (submission.status !== 'PENDING') {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Cannot Edit Submission</h1>
            <p className="text-muted-foreground mb-4">
              This submission cannot be edited because it is {submission.status.toLowerCase().replace('_', ' ')}.
            </p>
            <Button asChild>
              <Link href={`/submissions/${submissionId}`}>View Submission</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <AuthGuard>
          {/* Header */}
          <section className="bg-gradient-to-br from-background via-background to-primary/5 py-12">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="mb-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  <h1 className="text-3xl font-bold mb-2">
                    Edit Submission
                  </h1>
                  <p className="text-muted-foreground">
                    Update your submission for Challenge #{submission.challengeId}
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Update Your Submission</CardTitle>
                      <CardDescription>
                        Modify the links to your repository, pitch deck, and demo video
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Repository URL */}
                        <div className="space-y-2">
                          <label htmlFor="repoUrl" className="text-sm font-medium">
                            Repository URL *
                          </label>
                          <div className="relative">
                            <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="repoUrl"
                              type="url"
                              placeholder="https://github.com/username/project"
                              value={formData.repoUrl}
                              onChange={handleChange('repoUrl')}
                              className={`pl-10 ${errors.repoUrl ? 'border-destructive' : ''}`}
                            />
                          </div>
                          {errors.repoUrl && (
                            <p className="text-sm text-destructive">{errors.repoUrl}</p>
                          )}
                        </div>

                        {/* Pitch Deck URL */}
                        <div className="space-y-2">
                          <label htmlFor="pitchDeck" className="text-sm font-medium">
                            Pitch Deck URL *
                          </label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="pitchDeck"
                              type="url"
                              placeholder="https://drive.google.com/file/d/..."
                              value={formData.pitchDeck}
                              onChange={handleChange('pitchDeck')}
                              className={`pl-10 ${errors.pitchDeck ? 'border-destructive' : ''}`}
                            />
                          </div>
                          {errors.pitchDeck && (
                            <p className="text-sm text-destructive">{errors.pitchDeck}</p>
                          )}
                        </div>

                        {/* Demo Video URL */}
                        <div className="space-y-2">
                          <label htmlFor="demoVideo" className="text-sm font-medium">
                            Demo Video URL *
                          </label>
                          <div className="relative">
                            <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="demoVideo"
                              type="url"
                              placeholder="https://youtube.com/watch?v=..."
                              value={formData.demoVideo}
                              onChange={handleChange('demoVideo')}
                              className={`pl-10 ${errors.demoVideo ? 'border-destructive' : ''}`}
                            />
                          </div>
                          {errors.demoVideo && (
                            <p className="text-sm text-destructive">{errors.demoVideo}</p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={updateSubmissionMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateSubmissionMutation.isPending}
                            className="flex-1"
                          >
                            {updateSubmissionMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Updating...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Submission
                              </>
                            )}
                          </Button>
                        </div>

                        {updateSubmissionMutation.error && (
                          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive">
                              Failed to update submission. Please try again.
                            </p>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
} 