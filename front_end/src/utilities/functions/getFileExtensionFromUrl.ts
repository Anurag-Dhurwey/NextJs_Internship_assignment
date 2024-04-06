export function getFileExtensionFromUrl(url: string) {
    const urlParts = url.split(".");
    if (urlParts.length > 1) {
      return urlParts.pop()?.toLowerCase();
    }
    return null; // No file extension found
  }