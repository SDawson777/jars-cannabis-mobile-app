export interface CMSImageAsset {
  url: string;
  alt?: string;
}

export interface CMSProduct {
  __id: string;
  name: string;
  slug: string;
  price: number;
  type: string;
  effects?: string[];
  image: CMSImageAsset;
}

export interface CMSBanner {
  __id: string;
  title: string;
  cta?: string;
  link?: string;
  image: CMSImageAsset;
}

export interface CMSArticle {
  __id: string;
  title: string;
  slug: string;
  publishedAt: string;
  body: any;
  mainImage?: CMSImageAsset;
}

export interface CMSDrop {
  __id: string;
  title: string;
  highlight?: string;
  items: number;
  image: CMSImageAsset;
}
