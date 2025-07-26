export interface CMSImageAsset {
  url: string;
  alt?: string;
}

export interface CMSProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  type: string;
  effects?: string[];
  image: CMSImageAsset;
}

export interface CMSBanner {
  _id: string;
  title: string;
  cta?: string;
  link?: string;
  image: CMSImageAsset;
}

export interface CMSArticle {
  _id: string;
  title: string;
  slug: string;
  publishedAt: string;
  body: any;
  mainImage?: CMSImageAsset;
}

export interface CMSDrop {
  _id: string;
  title: string;
  highlight?: string;
  items: number;
  image: CMSImageAsset;
}
