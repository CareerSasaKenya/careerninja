/**
 * Strips HTML tags from a string and normalizes whitespace
 * @param html - The HTML string to clean
 * @returns Clean plain text
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  
  // Remove HTML tags using regex
  let text = html.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Normalize whitespace (multiple spaces, tabs, newlines to single space)
  text = text.replace(/\s+/g, " ");
  
  // Trim leading/trailing whitespace
  return text.trim();
};