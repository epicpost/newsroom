import { fetchSingle } from "./cms";

export type CompanyPageData = {
  hero?: { titleBeforeLogo?: string; logo?: string; titleAfterLogo?: string };
  about?: {
    eyebrow?: string;
    title?: string;
    cta?: { label?: string; href?: string; isExternal?: boolean };
  };
  valueCards?: { title: string; description?: string }[];
  workflow?: {
    tabs?: {
      label: string;
      title?: string;
      description?: string;
      image?: string;
      cta?: { label?: string; href?: string; isExternal?: boolean };
    }[];
    title?: string;
    description?: string;
    image?: string;
    cta?: { label?: string; href?: string; isExternal?: boolean };
  };
};

export type ContactPageData = {
  hero?: { title?: string };
  contactBlocks?: {
    title: string;
    description?: string;
    email?: string;
    linkLabel?: string;
  }[];
  useReadyAssetsCta?: boolean;
};

export type NewsroomHomePageData = {
  selectedStory?: {
    title?: string;
    description?: string;
    image?: string;
    cta?: { label?: string; href?: string };
  };
  readyAssetsCta?: boolean;
};

export async function getNewsroomHomePage(): Promise<NewsroomHomePageData | null> {
  const entry = await fetchSingle<NewsroomHomePageData>("newsroom-home-page", {
    populate: "deep",
  });
  return entry?.data ?? null;
}

export async function getCompanyPage(): Promise<CompanyPageData | null> {
  const entry = await fetchSingle<CompanyPageData>("company-page", {
    populate: "deep",
  });
  return entry?.data ?? null;
}

export async function getContactPage(): Promise<ContactPageData | null> {
  const entry = await fetchSingle<ContactPageData>("contact-page", {
    populate: "deep",
  });
  return entry?.data ?? null;
}
