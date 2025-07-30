export type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const getNavItems = (slug: string, website: string): NavItem[] => {
  return [
    {
      label: "Home",
      href: `/`,
    },
    {
      label: "Our Story",
      href: "/our-story",
    },
    {
      label: "Catering",
      href: "/catering",
    },
    // {
    //   label: "Our reviews",
    //   href: "/#our-reviews",
    // },
    {
      label: "Parties",
      href: "/parties",
    },
  ];
};
