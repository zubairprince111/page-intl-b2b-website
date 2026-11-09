export type UpdateCategory =
  "shipment_inbound" | "client_delivery" | "commissioning" | "tech_bulletin" | "product_launch";

export type FeedUpdate = {
  id: string;
  title: string;
  slug: string;
  category: UpdateCategory;
  categoryLabel?: string | undefined;
  date: string;
  summary: string;
  content: string;
  companyOrClient?: string | undefined;
  location: string;
  images: string[];
  equipmentNames?: string[] | undefined;
  badge?: string | undefined;
  pinned?: boolean | undefined;
  published: boolean;
  author: string;
  readTimeMinutes?: number | undefined;
  tags?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
};
