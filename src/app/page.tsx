
"use client";

import Image from 'next/image';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { generateLogo, type LogoGenerationInput } from '@/ai/flows/logo-generation';
import { Loader2, Palette, Image as ImageIcon, Type, CaseUpper, ShieldCheck, MinusSquare, BoxSelect, Shapes, ScrollText, Rocket, Combine, Smile, Baseline } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const logoGenerationSchema = z.object({
  brandName: z.string().min(1, { message: 'Brand name is required.' }).max(50, { message: 'Brand name must be 50 characters or less.'}),
  colorPalette: z.enum(['vibrant', 'pastel', 'dark mode', 'monochrome', 'Earthy Tones', 'Oceanic Blues', 'Sunset Hues', 'Forest Greens']),
  fontStyle: z.enum(['Serif', 'Sans-serif', 'Script', 'Display', 'Modern', 'Futuristic', 'Elegant', 'Playful']),
  designStyle: z.enum(['Minimalist', 'Geometric', 'Abstract', 'Vintage', 'Modern']),
  logoStyle: z.enum(['Icon-based', 'Wordmark', 'Lettermark', 'Emblem', 'Combination Mark', 'Mascot']),
});

type LogoGenerationFormValues = z.infer<typeof logoGenerationSchema>;

const designStyleOptions = [
  { value: 'Minimalist', label: 'Minimalist', icon: <MinusSquare className="w-10 h-10 mb-2" />, hint: "minimalist logo" },
  { value: 'Geometric', label: 'Geometric', icon: <BoxSelect className="w-10 h-10 mb-2" />, hint: "geometric logo" },
  { value: 'Abstract', label: 'Abstract', icon: <Shapes className="w-10 h-10 mb-2" />, hint: "abstract art" },
  { value: 'Vintage', label: 'Vintage', icon: <ScrollText className="w-10 h-10 mb-2" />, hint: "vintage emblem" },
  { value: 'Modern', label: 'Modern', icon: <Rocket className="w-10 h-10 mb-2" />, hint: "modern icon" },
] as const;

const logoStyleOptions = [
  { value: 'Icon-based', label: 'Icon-based', icon: <ImageIcon className="w-10 h-10 mb-2" /> },
  { value: 'Wordmark', label: 'Wordmark', icon: <Type className="w-10 h-10 mb-2" /> },
  { value: 'Lettermark', label: 'Lettermark', icon: <CaseUpper className="w-10 h-10 mb-2" /> },
  { value: 'Emblem', label: 'Emblem', icon: <ShieldCheck className="w-10 h-10 mb-2" /> },
  { value: 'Combination Mark', label: 'Combination', icon: <Combine className="w-10 h-10 mb-2" /> },
  { value: 'Mascot', label: 'Mascot', icon: <Smile className="w-10 h-10 mb-2" /> },
] as const;

const fontStyleOptions = [
  { value: 'Serif', label: 'Serif' },
  { value: 'Sans-serif', label: 'Sans-serif' },
  { value: 'Script', label: 'Script' },
  { value: 'Display', label: 'Display' },
  { value: 'Modern', label: 'Modern' },
  { value: 'Futuristic', label: 'Futuristic' },
  { value: 'Elegant', label: 'Elegant' },
  { value: 'Playful', label: 'Playful' },
] as const;


export default function HomePage() {
  const { toast } = useToast();
  const [logoDataUri, setLogoDataUri] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const form = useForm<LogoGenerationFormValues>({
    resolver: zodResolver(logoGenerationSchema),
    defaultValues: {
      brandName: '',
      colorPalette: 'vibrant',
      fontStyle: 'Modern',
      designStyle: 'Modern',
      logoStyle: 'Icon-based',
    },
  });

  const watchedBrandName = form.watch('brandName');

  async function onSubmit(data: LogoGenerationFormValues) {
    setIsLoading(true);
    setLogoDataUri(null);
    setFormError(null);
    try {
      const result = await generateLogo(data);
      setLogoDataUri(result.logoDataUri);
      toast({
        title: 'Logo Generated!',
        description: 'Your new logo is ready.',
      });
    } catch (error) {
      console.error('Error generating logo:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setFormError(`Failed to generate logo: ${errorMessage}`);
      toast({
        title: 'Generation Failed',
        description: `Could not generate logo. ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = () => {
    if (!logoDataUri) return;
    const link = document.createElement('a');
    link.href = logoDataUri;
    // Basic check for common image types, default to png
    const fileExtension = logoDataUri.substring(logoDataUri.indexOf('/') + 1, logoDataUri.indexOf(';base64')) || 'png';
    link.download = `${form.getValues('brandName') || 'logo'}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen flex flex-col">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-primary">Bizlogo Ai</h1>
        <p className="text-xl text-muted-foreground mt-2">Create your unique brand identity in seconds.</p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Customize Your Logo</CardTitle>
              <CardDescription>Fill in the details to generate your unique logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your brand name" {...field} className="transition-all duration-300 focus:ring-2 focus:ring-ring" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorPalette"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Palette</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-ring">
                              <SelectValue placeholder="Select a color palette" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vibrant">Vibrant</SelectItem>
                            <SelectItem value="pastel">Pastel</SelectItem>
                            <SelectItem value="dark mode">Dark Mode</SelectItem>
                            <SelectItem value="monochrome">Monochrome</SelectItem>
                            <SelectItem value="Earthy Tones">Earthy Tones</SelectItem>
                            <SelectItem value="Oceanic Blues">Oceanic Blues</SelectItem>
                            <SelectItem value="Sunset Hues">Sunset Hues</SelectItem>
                            <SelectItem value="Forest Greens">Forest Greens</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fontStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Style</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-ring">
                              <SelectValue placeholder="Select a font style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fontStyleOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="designStyle"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Design Style</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                          >
                            {designStyleOptions.map((option) => (
                              <FormItem key={option.value} className="flex items-center space-x-0">
                                <FormControl>
                                   <RadioGroupItem value={option.value} id={`design-${option.value}`} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={`design-${option.value}`}
                                  className={`cursor-pointer w-full rounded-md border-2 border-muted bg-popover p-3 hover:border-accent transition-all duration-300 ${field.value === option.value ? 'border-primary ring-2 ring-primary' : ''}`}
                                >
                                  <div className="flex flex-col items-center text-center space-y-1">
                                    {React.cloneElement(option.icon, { className: "w-10 h-10 mb-1 text-primary"})}
                                    <span className="text-xs font-medium">{option.label}</span>
                                  </div>
                                </Label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logoStyle"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Logo Style</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                          >
                            {logoStyleOptions.map((option) => (
                              <FormItem key={option.value} className="flex items-center space-x-0">
                                <FormControl>
                                  <RadioGroupItem value={option.value} id={`logo-${option.value}`} className="sr-only" />
                                </FormControl>
                                <Label
                                  htmlFor={`logo-${option.value}`}
                                  className={`cursor-pointer w-full rounded-md border-2 border-muted bg-popover p-3 hover:border-accent transition-all duration-300 ${field.value === option.value ? 'border-primary ring-2 ring-primary' : ''}`}
                                >
                                  <div className="flex flex-col items-center text-center space-y-1">
                                    {React.cloneElement(option.icon, { className: "w-8 h-8 mb-1 text-primary"})}
                                    <span className="text-xs font-medium">{option.label}</span>
                                  </div>
                                </Label>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 transition-all duration-300 hover:opacity-90">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Logo'
                    )}
                  </Button>
                  {formError && <p className="text-sm font-medium text-destructive">{formError}</p>}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 lg:sticky lg:top-8">
          <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="font-headline">Logo Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[300px] sm:min-h-[400px] p-4 bg-muted/30 rounded-md">
              {isLoading && (
                <div className="flex flex-col items-center animate-fade-in">
                  <Skeleton className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-md mb-4" />
                  <Skeleton className="w-[120px] h-[24px] rounded-md" />
                </div>
              )}
              {!isLoading && logoDataUri && (
                <div className="text-center animate-fade-in">
                  <Image src={logoDataUri} alt="Generated Logo" width={250} height={250} className="max-w-full max-h-[200px] sm:max-h-[250px] object-contain mb-4 rounded-md shadow-md" />
                  {watchedBrandName && <p className="text-2xl font-headline mt-2 text-foreground">{watchedBrandName}</p>}
                  <Button onClick={handleDownload} className="mt-6 transition-all duration-300 hover:opacity-90">
                    Download Logo
                  </Button>
                </div>
              )}
              {!isLoading && !logoDataUri && (
                <div className="text-center text-muted-foreground animate-fade-in">
                  <Palette className="h-16 w-16 mx-auto mb-4 text-primary opacity-70" />
                  <p className="text-lg">Your generated logo will appear here.</p>
                  {watchedBrandName && <p className="text-2xl font-headline mt-4 text-foreground">{watchedBrandName}</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="text-center py-8 mt-12 border-t">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Bizlogo Ai. All rights reserved.</p>
      </footer>
    </div>
  );
}
