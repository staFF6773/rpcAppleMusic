export async function fetchArtwork(title: string, artist: string, album?: string): Promise<string | undefined> {
  // Clean the title and artist for better search results
  const cleanTitle = title.replace(/\(feat\..*?\)/gi, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .trim();
  
  const cleanArtist = artist.replace(/,.*$/g, "").trim();

  const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=25`;

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.results && data.results.length > 0) {
      const results = data.results;
      
      const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      const targetTitle = normalize(cleanTitle);
      const targetArtist = normalize(cleanArtist);
      const targetAlbum = album ? normalize(album) : "";

      let bestMatch = results[0];
      let highestScore = -1;

      for (const item of results) {
        let score = 0;
        const itemTitle = normalize(item.trackName || "");
        const itemArtist = normalize(item.artistName || "");
        const itemAlbum = normalize(item.collectionName || "");

        // Artist matching (high priority)
        if (itemArtist === targetArtist) score += 100;
        else if (itemArtist.includes(targetArtist) || targetArtist.includes(itemArtist)) score += 40;

        // Title matching
        if (itemTitle === targetTitle) score += 100;
        else if (itemTitle.includes(targetTitle) || targetTitle.includes(itemTitle)) score += 40;

        // Album matching
        if (targetAlbum) {
          if (itemAlbum === targetAlbum) score += 80;
          else if (itemAlbum.includes(targetAlbum) || targetAlbum.includes(itemAlbum)) score += 30;
        }

        // Penalty for "Remaster" if not in original but in item (to prefer originals)
        if (itemTitle.includes("remaster") && !targetTitle.includes("remaster")) score -= 10;
        if (itemAlbum.includes("collection") || itemAlbum.includes("greatest hits")) score -= 5;

        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }

      return bestMatch.artworkUrl100?.replace("100x100", "600x600");
    }
  } catch (error) {
    // Silently fail
  }
  return undefined;
}
