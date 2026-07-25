"use client"

import { useState, RefObject } from "react"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface PDFDownloadButtonProps {
  targetRef: RefObject<HTMLDivElement | null>
  filename: string
}

export function PDFDownloadButton({ targetRef, filename }: PDFDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    if (!targetRef.current) return
    setIsDownloading(true)

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        // Use html2canvas-pro — supports modern CSS colors (oklch, lab, etc.)
        import("html2canvas-pro"),
      ])

      const element = targetRef.current

      // Assign temporary ID if needed to find it in the cloned document
      const originalId = element.id;
      if (!originalId) element.id = "pdf-export-target-id";

      let sliceData: { width: number, height: number, relativeTop: number, relativeLeft: number }[] = [];
      let clonedScrollWidth = element.scrollWidth;
      let clonedScrollHeight = element.scrollHeight;

      const canvas = await html2canvas(element, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const body = clonedDoc.body;
          const root = clonedDoc.documentElement;
          
          // Force light mode
          root.classList.remove("dark");
          root.classList.add("light");
          root.style.colorScheme = "light";

          // Force framer-motion elements to be visible (fixes blank sections if not scrolled)
          const allElements = clonedDoc.querySelectorAll('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style) {
              if (el.style.opacity !== '') el.style.opacity = '1';
              if (el.style.transform && (el.style.transform.includes('translateY') || el.style.transform.includes('scale'))) {
                el.style.transform = 'none';
              }
            }
          }
          
          // Inject Professional Print Styles
          const style = clonedDoc.createElement("style");
          style.innerHTML = `
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .light {
              background-color: #ffffff !important;
              color: #1a1a1a !important;
            }
            /* Preserve layout UI but ensure colors print nicely */
            .border { border-color: #e2e8f0 !important; }
            .text-cyan-400, .text-cyan-500, .text-cyan-600 { color: #0891b2 !important; }
            .bg-cyan-500\\/10, .bg-cyan-500\\/50 { background-color: #f0f9ff !important; }
            
            /* Hide non-report elements if any */
            button, .download-button { display: none !important; }
          `;
          clonedDoc.head.appendChild(style);

          // Measure elements in the cloned document AFTER styles are applied
          const clonedEl = clonedDoc.getElementById(element.id);
          if (clonedEl) {
            clonedScrollWidth = clonedEl.scrollWidth;
            clonedScrollHeight = clonedEl.scrollHeight;
            const cParentRect = clonedEl.getBoundingClientRect();
            
            const cElements = Array.from(clonedEl.querySelectorAll('.pdf-export-element'));
            sliceData = cElements.map(el => {
              const rect = el.getBoundingClientRect();
              return {
                width: rect.width,
                height: rect.height,
                relativeTop: rect.top - cParentRect.top + clonedEl.scrollTop,
                relativeLeft: rect.left - cParentRect.left + clonedEl.scrollLeft,
              };
            });
          }
        }
      })

      // Restore original ID
      element.id = originalId;

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfPageWidth = 210;
      const pdfPageHeight = 297;
      const marginX = 15;
      const marginY = 20;
      const pdfContentWidth = pdfPageWidth - (marginX * 2);
      
      let currentPdfY = marginY;

      // Create a temporary canvas for cropping
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');

      // If no elements found, fallback to rendering the whole thing
      if (sliceData.length === 0) {
        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        const imgHeight = (canvas.height * pdfContentWidth) / canvas.width;
        pdf.addImage(imgData, "JPEG", marginX, marginY, pdfContentWidth, imgHeight);
      } else {
        for (let i = 0; i < sliceData.length; i++) {
          const sData = sliceData[i];
          
          const scaleX = canvas.width / clonedScrollWidth;
          const scaleY = canvas.height / clonedScrollHeight;
          
          // Use asymmetric buffers: larger top buffer to catch absolute -top-3 labels like Synthesis Overview
          const topBuffer = 16;
          const bottomBuffer = 4;
          const sideBuffer = 2;
          
          const sourceX = Math.max(0, (sData.relativeLeft - sideBuffer) * scaleX);
          const sourceY = Math.max(0, (sData.relativeTop - topBuffer) * scaleY);
          const sourceWidth = (sData.width + sideBuffer * 2) * scaleX;
          const sourceHeight = (sData.height + topBuffer + bottomBuffer) * scaleY;

          if (sourceWidth <= 0 || sourceHeight <= 0) continue;

          tempCanvas.width = sourceWidth;
          tempCanvas.height = sourceHeight;
          
          tempCtx?.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx?.drawImage(
            canvas,
            sourceX, sourceY, sourceWidth, sourceHeight,
            0, 0, sourceWidth, sourceHeight
          );

          const imgData = tempCanvas.toDataURL("image/jpeg", 0.95);
          const ratio = pdfContentWidth / (sData.width + sideBuffer * 2);
          const pdfImgHeight = (sData.height + topBuffer + bottomBuffer) * ratio;

          // Page Break Logic: More safety margin (10mm) to prevent clipping at bottom
          if (currentPdfY + pdfImgHeight > pdfPageHeight - marginY - 5) {
            if (currentPdfY !== marginY) { 
              pdf.addPage();
              currentPdfY = marginY;
            }
          }

          pdf.addImage(imgData, "JPEG", marginX, currentPdfY, pdfContentWidth, pdfImgHeight);
          currentPdfY += pdfImgHeight + 6; // 6mm gap between elements
        }
      }

      const safeName = filename
        .replace(/[^a-z0-9]/gi, "_")
        .replace(/_+/g, "_")
        .substring(0, 50)

      pdf.save(`${safeName}_Research_Report.pdf`)
      toast.success("PDF Downloaded Successfully!")

    } catch (error: any) {
      console.error("PDF generation error:", error)
      toast.error(`PDF failed: ${error.message ?? "Unknown error"}`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownloadPDF} disabled={isDownloading} className="gap-2">
      {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isDownloading ? "Generating..." : "Download PDF"}
    </Button>
  )
}
