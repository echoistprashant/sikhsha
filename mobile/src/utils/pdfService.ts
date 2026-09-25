import RNPrint from 'react-native-print';
import RNFS from 'react-native-fs';

interface PDFOptions {
    html: string;
    fileName: string;
}

/**
 * Generate and print/save PDF using react-native-print
 * This uses the native print dialog which allows users to save as PDF
 */
export const generatePDF = async ({ html, fileName }: PDFOptions): Promise<string | null> => {
    try {
        // Save HTML to temp file first (required for some Android devices)
        const timestamp = Date.now();
        const htmlFileName = `${fileName}_${timestamp}.html`;
        const filePath = `${RNFS.DocumentDirectoryPath}/${htmlFileName}`;

        await RNFS.writeFile(filePath, html, 'utf8');

        return filePath;
    } catch (error) {
        console.error('File save error:', error);
        throw error;
    }
};

/**
 * Open native print dialog to print or save as PDF
 * This replaces the share functionality with native print dialog
 */
export const sharePDF = async (filePath: string, fileName: string) => {
    try {
        // Read the HTML file
        const htmlContent = await RNFS.readFile(filePath, 'utf8');

        // Open native print dialog
        await RNPrint.print({
            html: htmlContent,
            fileName: fileName,
        });

        console.log('Print dialog opened successfully');
    } catch (error: any) {
        console.error('Print Error:', error);
        throw error;
    }
};
