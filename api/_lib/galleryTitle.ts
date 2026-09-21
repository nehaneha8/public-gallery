// The gallery's display title: the artist's own custom text if they've set
// one, otherwise "{name}'s Gallery" — computed here so every endpoint that
// surfaces a gallery's title (directory listing, gallery page, dashboard)
// resolves it identically.
export function resolveGalleryTitle(displayName: string, galleryTitle: string | null): string {
  return galleryTitle?.trim() || `${displayName}'s Gallery`;
}
