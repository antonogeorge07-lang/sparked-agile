/**
 * Utility functions for text formatting
 * Ensures AI responses are displayed as clean, human-readable text
 */

/**
 * Strips markdown formatting from text to display clean output
 * Removes: **bold**, *italic*, `code`, ### headers, bullet points, etc.
 */
export const stripMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove bold/italic markers
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // ***bold italic***
    .replace(/\*\*(.+?)\*\*/g, '$1')       // **bold**
    .replace(/\*(.+?)\*/g, '$1')           // *italic*
    .replace(/___(.+?)___/g, '$1')         // ___bold italic___
    .replace(/__(.+?)__/g, '$1')           // __bold__
    .replace(/_(.+?)_/g, '$1')             // _italic_
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')           // `code`
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')        // ```code blocks```
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')           // # Header
    // Remove blockquotes
    .replace(/^>\s+/gm, '')                // > quote
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')          // --- or *** or ___
    // Remove link formatting but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [text](url) -> text
    // Remove image markdown
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // ![alt](url) -> alt
    // Clean up bullet points (keep the text, remove markers)
    .replace(/^[\s]*[-*+]\s+/gm, '• ')     // - item -> • item
    // Clean up numbered lists
    .replace(/^[\s]*\d+\.\s+/gm, '')       // 1. item -> item
    // Remove extra whitespace
    .replace(/\n{3,}/g, '\n\n')            // Multiple newlines -> double
    .trim();
};

/**
 * Formats AI response for display - strips markdown and ensures clean output
 */
export const formatAIResponse = (response: string): string => {
  return stripMarkdown(response);
};

/**
 * Sanitizes text for safe HTML display (prevents XSS)
 */
export const sanitizeForDisplay = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
