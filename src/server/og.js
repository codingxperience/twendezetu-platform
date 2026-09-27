// Link previews. WhatsApp, Facebook and X want a 1200×630 image for a large
// card; Unsplash can crop to exactly that, local assets are used as they are.

export function ogImages(img, alt) {
  if (typeof img === 'string' && /images\.unsplash\.com/.test(img)) {
    return [{ url: `${img.split('?')[0]}?w=1200&h=630&fit=crop&q=80`, width: 1200, height: 630, type: 'image/jpeg', alt }];
  }
  return [{ url: img, alt }];
}

export function previewMetadata({ title, description, path, image, site = 'Twendezetu' }) {
  const images = ogImages(image, title);
  return {
    title: `${title} — ${site}`,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, type: 'website', siteName: site, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map((item) => item.url) },
  };
}
