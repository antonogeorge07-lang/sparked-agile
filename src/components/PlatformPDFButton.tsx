import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { generatePlatformOverviewPDF } from '@/utils/generatePlatformPDF';
import { toast } from 'sonner';

interface PlatformPDFButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PlatformPDFButton({ 
  variant = 'default', 
  size = 'default',
  className 
}: PlatformPDFButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      generatePlatformOverviewPDF();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGeneratePDF}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
          <span className="hidden sm:inline ml-2">Generating...</span>
        </>
      ) : (
        <>
          <FileDown className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline ml-2">PDF</span>
        </>
      )}
    </Button>
  );
}
