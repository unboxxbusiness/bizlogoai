
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
import { Loader2, Palette, Image as ImageIcon, Type, CaseUpper, ShieldCheck, MinusSquare, BoxSelect, Shapes, ScrollText, Rocket, Combine, Smile, Baseline, Download, Settings2, ChevronDown, ExternalLink } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


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

const resizeOptions = [
  { label: 'YouTube Profile (800x800 px)', width: 800, height: 800, format: 'PNG', name: 'youtube_profile' },
  { label: 'Instagram Profile (320x320 px)', width: 320, height: 320, format: 'PNG', name: 'instagram_profile' },
  { label: 'Facebook Profile (180x180 px)', width: 180, height: 180, format: 'PNG', name: 'facebook_profile' },
  { label: 'Website Header (250x100 px)', width: 250, height: 100, format: 'PNG', name: 'website_header' },
  { label: 'Mobile Logo (120x60 px)', width: 120, height: 60, format: 'PNG', name: 'mobile_logo' },
  { label: 'Favicon (32x32 px)', width: 32, height: 32, format: 'PNG', name: 'favicon' },
] as const;


export default function HomePage() {
  const { toast } = useToast();
  const [logoDataUri, setLogoDataUri] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResizing, setIsResizing] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [currentYear, setCurrentYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

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
    const fileExtension = logoDataUri.substring(logoDataUri.indexOf('/') + 1, logoDataUri.indexOf(';base64')) || 'png';
    link.download = `${form.getValues('brandName') || 'logo'}_original.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResizeAndDownload = async (option: typeof resizeOptions[0]) => {
    if (!logoDataUri || !watchedBrandName) {
      toast({
        title: 'Error',
        description: 'Please generate a logo first and ensure brand name is set.',
        variant: 'destructive',
      });
      return;
    }
    setIsResizing(true);

    try {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = option.width;
        canvas.height = option.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          toast({
            title: 'Resize Failed',
            description: 'Could not process image (canvas context error).',
            variant: 'destructive',
          });
          setIsResizing(false);
          return;
        }

        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;
        const targetWidth = option.width;
        const targetHeight = option.height;
        
        let drawWidth, drawHeight, drawX, drawY;

        // Calculate aspect ratios
        const originalAspectRatio = originalWidth / originalHeight;
        const targetAspectRatio = targetWidth / targetHeight;

        // Determine how to fit the image
        if (originalAspectRatio > targetAspectRatio) {
            // Original image is wider than target
            drawHeight = targetHeight;
            drawWidth = originalWidth * (targetHeight / originalHeight);
            drawX = (targetWidth - drawWidth) / 2; // Center horizontally
            drawY = 0;
        } else {
            // Original image is taller than or same aspect ratio as target
            drawWidth = targetWidth;
            drawHeight = originalHeight * (targetWidth / originalWidth);
            drawX = 0;
            drawY = (targetHeight - drawHeight) / 2; // Center vertically
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);


        const resizedLogoDataUri = canvas.toDataURL(`image/${option.format.toLowerCase()}`);
        
        const link = document.createElement('a');
        link.href = resizedLogoDataUri;
        const fileExtension = option.format.toLowerCase();
        link.download = `${watchedBrandName}_${option.name}_${option.width}x${option.height}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Logo Resized & Downloaded!',
          description: `Resized logo (${option.label}) downloaded.`,
        });
        setIsResizing(false);
      };
      img.onerror = () => {
        toast({
          title: 'Resize Failed',
          description: 'Could not load the original logo for resizing.',
          variant: 'destructive',
        });
        setIsResizing(false);
      };
      img.src = logoDataUri;

    } catch (error) {
      console.error(`Error resizing logo to ${option.width}x${option.height}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        title: 'Resize Failed',
        description: `Could not resize logo to ${option.label}. ${errorMessage}`,
        variant: 'destructive',
      });
      setIsResizing(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4">
          <header className="flex justify-between items-center py-3">
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-primary">Bizlogo Ai</h1>
            <Button asChild variant="outline" size="sm">
              <a href="https://www.learncodewithrk.in/" target="_blank" rel="noopener noreferrer">
                More Tools
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </header>
        </div>
      </div>

      <div className="container mx-auto px-4 flex-grow flex flex-col pt-16 sm:pt-20">
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="font-headline text-2xl sm:text-3xl">Customize Your Logo</CardTitle>
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
                              className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
                            >
                              {designStyleOptions.map((option) => (
                                <FormItem key={option.value} className="flex items-center space-x-0">
                                  <FormControl>
                                    <RadioGroupItem value={option.value} id={`design-${option.value}`} className="sr-only" />
                                  </FormControl>
                                  <Label
                                    htmlFor={`design-${option.value}`}
                                    className={`cursor-pointer w-full rounded-md border-2 border-muted bg-popover p-2 sm:p-3 hover:border-accent transition-all duration-300 ${field.value === option.value ? 'border-primary ring-2 ring-primary' : ''}`}
                                  >
                                    <div className="flex flex-col items-center text-center space-y-1">
                                      {React.cloneElement(option.icon, { className: "w-6 h-6 sm:w-8 sm:h-8 mb-1 text-primary"})}
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
                              className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
                            >
                              {logoStyleOptions.map((option) => (
                                <FormItem key={option.value} className="flex items-center space-x-0">
                                  <FormControl>
                                    <RadioGroupItem value={option.value} id={`logo-${option.value}`} className="sr-only" />
                                  </FormControl>
                                  <Label
                                    htmlFor={`logo-${option.value}`}
                                    className={`cursor-pointer w-full rounded-md border-2 border-muted bg-popover p-2 sm:p-3 hover:border-accent transition-all duration-300 ${field.value === option.value ? 'border-primary ring-2 ring-primary' : ''}`}
                                  >
                                    <div className="flex flex-col items-center text-center space-y-1">
                                      {React.cloneElement(option.icon, { className: "w-6 h-6 sm:w-8 sm:h-8 mb-1 text-primary"})}
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

                    <Button type="submit" disabled={isLoading || isResizing} className="w-full text-base sm:text-lg py-3 sm:py-4 transition-all duration-300 hover:opacity-90">
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
                <CardTitle className="font-headline text-2xl sm:text-3xl">Logo Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] lg:min-h-[350px] p-4 bg-muted/30 rounded-md">
                {isLoading && (
                  <div className="flex flex-col items-center animate-fade-in">
                    <Skeleton className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] lg:w-[150px] lg:h-[150px] rounded-md mb-4" />
                    <Skeleton className="w-[80px] h-[20px] sm:w-[100px] sm:h-[24px] rounded-md" />
                  </div>
                )}
                {!isLoading && logoDataUri && (
                  <div className="text-center animate-fade-in">
                    <Image src={logoDataUri} alt="Generated Logo" width={250} height={250} className="max-w-full max-h-[150px] sm:max-h-[180px] lg:max-h-[200px] object-contain mb-4 rounded-md shadow-md" />
                    {watchedBrandName && <p className="text-xl sm:text-2xl font-headline mt-2 text-foreground">{watchedBrandName}</p>}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                      <Button onClick={handleDownload} className="transition-all duration-300 hover:opacity-90 w-full sm:w-auto" disabled={isResizing}>
                        <Download className="mr-2 h-4 w-4" /> Download Original
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="transition-all duration-300 hover:opacity-90 w-full sm:w-auto" disabled={isResizing || !logoDataUri}>
                            {isResizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings2 className="mr-2 h-4 w-4" />}
                            Resize Logo
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Select Size to Download</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {resizeOptions.map((option) => (
                            <DropdownMenuItem key={option.name} onClick={() => handleResizeAndDownload(option)} disabled={isResizing}>
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                  </div>
                )}
                {!isLoading && !logoDataUri && (
                  <div className="text-center text-muted-foreground animate-fade-in">
                    <Palette className="h-10 w-10 sm:h-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-primary opacity-70" />
                    <p className="text-base sm:text-lg">Your generated logo will appear here.</p>
                    {watchedBrandName && <p className="text-xl sm:text-2xl font-headline mt-3 sm:mt-4 text-foreground">{watchedBrandName}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
        <footer className="text-center py-4 sm:py-6 mt-10 sm:mt-12 border-t">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {currentYear !== null ? `© ${currentYear} Bizlogo Ai. All rights reserved.` : 'Loading year...'}
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            <a href="https://www.learncodewithrk.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">
              www.learncodewithrk.in
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
