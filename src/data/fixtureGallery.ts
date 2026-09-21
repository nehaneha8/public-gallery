import type { GalleryConfig } from './galleryConfig';

// The site's own original hardcoded gallery, ported over as the default
// GalleryConfig — used until real per-user galleries are wired up via the
// backend (see the plan's Phase 5+). Order below alternates left/right to
// roughly match the original hand-placed layout.
export const fixtureGallery: GalleryConfig = {
  slug: 'neha',
  displayName: 'Neha',
  title: "Neha's Gallery",
  artworks: [
    { id: 'scream', title: 'Spl it', description: 'Acrylic on canvas', src: '/art/scream.webp', aspectRatio: 0.7711, size: 'large' },
    { id: 'skull', title: 'In the end', description: 'Graphite on paper', src: '/art/skull.webp', aspectRatio: 0.7859, size: 'medium' },
    { id: 'curler', title: 'Even at 50', description: 'Acrylic on canvas', src: '/art/curler.webp', aspectRatio: 0.755, size: 'medium' },
    { id: 'womanbaby', title: 'Carry', description: 'Acrylic on canvas, displayed in Oakville artshow', src: '/art/womanbaby.webp', aspectRatio: 0.8303, size: 'large' },
    { id: 'italy', title: 'The Bluff', description: 'Acrylic on canvas', src: '/art/italy.webp', aspectRatio: 0.725, size: 'large' },
    { id: 'snake', title: 'Medusa', description: 'Largely done with pen & marker, some paint.', src: '/art/snake.webp', aspectRatio: 0.755, size: 'medium' },
    { id: 'abstact', title: 'Just Lines', description: 'Acrylic on canvas', src: '/art/abstact.webp', aspectRatio: 0.7412, size: 'large' },
    { id: 'sunset', title: 'Dusk', description: 'Watercolor, done by 5 year old me', src: '/art/sunset.webp', aspectRatio: 1.2471, size: 'small' },
    { id: 'hands', title: 'Never', description: 'Acrylic on canvas', src: '/art/hands.webp', aspectRatio: 1.3758, size: 'medium' },
    { id: 'spider', title: 'Nonsense', description: 'Myriad of mediums on canvas', src: '/art/spider.webp', aspectRatio: 0.8281, size: 'medium' },
    { id: 'newpiece', title: 'Cloth', description: 'Charcoal', src: '/art/curtain.webp', aspectRatio: 1.533, size: 'large' },
    { id: 'flower2', title: 'Bloom II', description: 'Paint & marker on wood, 2/2', src: '/art/flower2.webp', aspectRatio: 0.8006, size: 'small' },
    { id: 'flower', title: 'Bloom I', description: 'Paint & marker on wood, 1/2', src: '/art/flower.webp', aspectRatio: 0.8069, size: 'small' },
  ],
  sketches: [
    { id: 'suits', src: '/art/suits.webp' },
    { id: 'gm', src: '/art/gm.webp' },
    { id: 'dragon', src: '/art/dragon.webp' },
    { id: 'Archie', src: '/art/Archie.webp' },
    { id: 'backpack', src: '/art/backpack.webp' },
    { id: 'pressure', src: '/art/pressure.webp' },
  ],
  about: null,
};
