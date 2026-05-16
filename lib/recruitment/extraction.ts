export type ParsedExtractionSource = {
  extracted_json?: unknown;
  raw_llm_response?: string | null;
  raw_text?: string;
} | string | null | undefined;

export function parseExtractedResume(source: ParsedExtractionSource): unknown | null {
  if (!source) return null;

  if (typeof source === "string") {
    try {
      return JSON.parse(source);
    } catch {
      return null;
    }
  }

  if (typeof source === "object") {
    const extractedJson = (source as { extracted_json?: unknown }).extracted_json;
    if (extractedJson) return extractedJson;

    const rawResponse = (source as { raw_llm_response?: string | null }).raw_llm_response;
    if (rawResponse) {
      try {
        return JSON.parse(rawResponse);
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function getExtractionRawText(source: ParsedExtractionSource): string {
  if (!source) return "";

  if (typeof source === "string") return source;

  if (typeof source === "object") {
    return (
      (source as { raw_text?: string }).raw_text ||
      (source as { raw_llm_response?: string | null }).raw_llm_response ||
      ""
    );
  }

  return "";
}