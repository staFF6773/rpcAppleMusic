export async function fetchArtwork(title: string, artist: string): Promise<string | undefined> {
  // Clean the title and artist for better search results
  // Remove (feat. ...), [Official Video], etc.
  const cleanTitle = title.replace(/\(feat\..*?\)/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  
  const cleanArtist = artist.replace(/,.*$/g, "").trim(); // Take first artist if comma separated

  const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=5`;

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.results && data.results.length > 0) {
      // Find the best match
      // For now we take the first, but we could do more validation
      const bestMatch = data.results[0];
      return bestMatch.artworkUrl100?.replace("100x100", "600x600");
    }
  } catch (error) {
    // Silently fail
  }
  return undefined;
}
