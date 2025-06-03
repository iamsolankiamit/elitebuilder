'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Calendar, DollarSign, FileText, Link as LinkIcon } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateChallenge } from '@/hooks/use-challenges';
import type { CreateChallengeDto } from '@/lib/types';

export default function CreateChallengePage() {
  const router = useRouter();
  const createMutation = useCreateChallenge();
  
  const [formData, setFormData] = useState<CreateChallengeDto>({
    title: '',
    description: '',
    dataset: '',
    rubric: '',
    deadline: '',
    prize: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.rubric.trim()) {
      newErrors.rubric = 'Evaluation rubric is required';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    if (formData.prize && formData.prize < 0) {
      newErrors.prize = 'Prize must be a positive number';
    }

    if (formData.dataset && !isValidUrl(formData.dataset)) {
      newErrors.dataset = 'Please enter a valid URL';
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
      const challengeData: CreateChallengeDto = {
        ...formData,
        prize: formData.prize || undefined,
        dataset: formData.dataset || undefined,
      };

      const newChallenge = await createMutation.mutateAsync(challengeData);
      router.push(`/challenges/${newChallenge.id}`);
    } catch (error) {
      console.error('Failed to create challenge:', error);
    }
  };

  const handleChange = (field: keyof CreateChallengeDto) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'prize' ? parseFloat(e.target.value) || undefined : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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
                  Create Challenge
                </h1>
                <p className="text-xl text-muted-foreground">
                  Design a new AI challenge for the community
                </p>
              </motion.div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-12">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-2xl mx-auto"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Challenge Details</CardTitle>
                    <CardDescription>
                      Fill in the information below to create your challenge
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Title */}
                      <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium">
                          Challenge Title *
                        </label>
                        <Input
                          id="title"
                          placeholder="e.g., Build an AI-Powered Recommendation Engine"
                          value={formData.title}
                          onChange={handleChange('title')}
                          className={errors.title ? 'border-destructive' : ''}
                        />
                        {errors.title && (
                          <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-medium">
                          Description *
                        </label>
                        <Textarea
                          id="description"
                          placeholder="Describe what participants need to build, what problems they need to solve, and any specific requirements..."
                          value={formData.description}
                          onChange={handleChange('description')}
                          className={`min-h-[120px] ${errors.description ? 'border-destructive' : ''}`}
                        />
                        {errors.description && (
                          <p className="text-sm text-destructive">{errors.description}</p>
                        )}
                      </div>

                      {/* Evaluation Rubric */}
                      <div className="space-y-2">
                        <label htmlFor="rubric" className="text-sm font-medium">
                          Evaluation Rubric *
                        </label>
                        <Textarea
                          id="rubric"
                          placeholder="Explain how submissions will be evaluated. Include criteria like functionality, code quality, innovation, user experience, etc."
                          value={formData.rubric}
                          onChange={handleChange('rubric')}
                          className={`min-h-[120px] ${errors.rubric ? 'border-destructive' : ''}`}
                        />
                        {errors.rubric && (
                          <p className="text-sm text-destructive">{errors.rubric}</p>
                        )}
                      </div>

                      {/* Dataset URL */}
                      <div className="space-y-2">
                        <label htmlFor="dataset" className="text-sm font-medium">
                          Dataset URL (Optional)
                        </label>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dataset"
                            type="url"
                            placeholder="https://example.com/dataset.zip"
                            value={formData.dataset}
                            onChange={handleChange('dataset')}
                            className={`pl-10 ${errors.dataset ? 'border-destructive' : ''}`}
                          />
                        </div>
                        {errors.dataset && (
                          <p className="text-sm text-destructive">{errors.dataset}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Provide a URL to download the dataset if participants need specific data
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Deadline */}
                        <div className="space-y-2">
                          <label htmlFor="deadline" className="text-sm font-medium">
                            Deadline *
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="deadline"
                              type="datetime-local"
                              value={formData.deadline}
                              onChange={handleChange('deadline')}
                              className={`pl-10 ${errors.deadline ? 'border-destructive' : ''}`}
                              min={new Date().toISOString().slice(0, 16)}
                            />
                          </div>
                          {errors.deadline && (
                            <p className="text-sm text-destructive">{errors.deadline}</p>
                          )}
                        </div>

                        {/* Prize */}
                        <div className="space-y-2">
                          <label htmlFor="prize" className="text-sm font-medium">
                            Prize Amount (Optional)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="prize"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={formData.prize || ''}
                              onChange={handleChange('prize')}
                              className={`pl-10 ${errors.prize ? 'border-destructive' : ''}`}
                            />
                          </div>
                          {errors.prize && (
                            <p className="text-sm text-destructive">{errors.prize}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Enter the total prize amount in USD
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="flex gap-4 pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => router.back()}
                          disabled={createMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={createMutation.isPending}
                          className="flex-1 hover-lift glow-on-hover"
                        >
                          {createMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Creating Challenge...
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" />
                              Create Challenge
                            </>
                          )}
                        </Button>
                      </div>

                      {createMutation.error && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive">
                            Failed to create challenge. Please try again.
                          </p>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
} 