// src/lib/invoice.ts
import type { InvoiceItem } from "@/types";

const isClient = typeof window !== "undefined";

export interface InvoiceData {
  // ... (keep your existing interface)
}

// Client-side only function to initialize the invoice generator
const getInvoiceGenerator = () => {
  if (!isClient) {
    return {
      generateInvoicePdf: () => Promise.reject(new Error('Cannot generate PDF on server side')),
      downloadPdf: () => {},
      openPrintWindow: () => {},
      getBase64FromUrl: () => Promise.reject(new Error('Cannot process images on server side'))
    };
  }

  // These will only be imported on the client side
  const easyinvoicePromise = import('easyinvoice').then(mod => mod.default);

  return {
    async generateInvoicePdf(invoiceData: Partial<InvoiceData>) {
      try {
        const easyinvoice = await easyinvoicePromise;
        const defaultData: InvoiceData = {
          // ... (your default data)
        };
        const data = { ...defaultData, ...invoiceData };
        const result = await easyinvoice.createInvoice(data);
        return result.pdf;
      } catch (error) {
        console.error('Error generating invoice:', error);
        throw error;
      }
    },

    downloadPdf(pdfData: string, filename = "invoice") {
      const link = document.createElement("a");
      link.href = pdfData;
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },

    openPrintWindow(pdfData: string) {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`
          <html>
            <head><title>Print Invoice</title></head>
            <body style="margin: 0; padding: 0;">
              <iframe src="${pdfData}" style="width: 100%; height: 100vh; border: none;"></iframe>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.focus();
                    window.print();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
    },

    async getBase64FromUrl(url: string): Promise<string> {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  };
};

// Export the functions
export const invoice = getInvoiceGenerator();