'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Upload, Github, FileText, Video, Link as LinkIcon } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useChallenge, useCreateSubmission } from '@/hooks/use-challenges';
import type { CreateSubmissionDto } from '@/lib/types';

export default function SubmitPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = parseInt(params.id as string);
  
  const { data: challenge, isLoading: challengeLoading } = useChallenge(challengeId);
  const createSubmissionMutation = useCreateSubmission();
  
  const [formData, setFormData] = useState<CreateSubmissionDto>({
    repoUrl: '',
    pitchDeck: '',
    demoVideo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
      await createSubmissionMutation.mutateAsync({
        challengeId,
        data: formData,
      });
      router.push(`/challenges/${challengeId}`);
    } catch (error) {
      console.error('Failed to create submission:', error);
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

  if (challengeLoading) {
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

  if (!challenge) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Challenge Not Found</h1>
            <p className="text-muted-foreground mb-4">The challenge you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/challenges">Back to Challenges</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isExpired = new Date(challenge.deadline) < new Date();

  if (isExpired) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Challenge Expired</h1>
            <p className="text-muted-foreground mb-4">This challenge has ended and no longer accepts submissions.</p>
            <Button asChild>
              <Link href={`/challenges/${challengeId}`}>Back to Challenge</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!challenge.isParticipating) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Not Participating</h1>
            <p className="text-muted-foreground mb-4">You need to join this challenge before you can submit.</p>
            <Button asChild>
              <Link href={`/challenges/${challengeId}`}>Join Challenge</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (challenge.hasSubmitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Already Submitted</h1>
            <p className="text-muted-foreground mb-4">You have already submitted a solution for this challenge.</p>
            <Button asChild>
              <Link href={`/challenges/${challengeId}`}>View Challenge</Link>
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
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-background via-background to-primary/5 py-16">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                  Submit Solution
                </h1>
                <p className="text-xl text-muted-foreground mb-2">
                  {challenge.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  Deadline: {new Date(challenge.deadline).toLocaleDateString()} at {new Date(challenge.deadline).toLocaleTimeString()}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Challenge Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Challenge Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {challenge.description}
                      </p>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Evaluation Criteria:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {challenge.rubric}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Submission Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Submit Your Solution</CardTitle>
                      <CardDescription>
                        Provide links to your repository, pitch deck, and demo video
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
                          <p className="text-sm text-muted-foreground">
                            Link to your project's source code repository
                          </p>
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
                          <p className="text-sm text-muted-foreground">
                            Link to your presentation slides (PDF, Google Slides, etc.)
                          </p>
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
                          <p className="text-sm text-muted-foreground">
                            Link to your demo video (YouTube, Vimeo, Loom, etc.)
                          </p>
                        </div>

                        {/* Submission Guidelines */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Submission Guidelines</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Ensure your repository is public or accessible</li>
                            <li>• Include a clear README with setup instructions</li>
                            <li>• Your pitch deck should explain the problem, solution, and implementation</li>
                            <li>• Demo video should be 2-5 minutes showcasing your solution</li>
                          </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={createSubmissionMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={createSubmissionMutation.isPending}
                            className="flex-1 hover-lift glow-on-hover"
                          >
                            {createSubmissionMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Submit Solution
                              </>
                            )}
                          </Button>
                        </div>

                        {createSubmissionMutation.error && (
                          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                            <p className="text-sm text-destructive">
                              Failed to submit solution. Please try again.
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