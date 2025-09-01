"use client";

import ToastStore from "@/store/toast";
import dynamic from "next/dynamic";
import { Bebas_Neue, Karla, Rubik } from "next/font/google";
import { Suspense, useEffect, useState } from "react";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import { getCookie, setCookie } from "@/utils/UtilFncs";
import { sdk } from "@/utils/graphqlClient";
import { CmsPopupContent, CmsPromoPopup } from "@/generated/graphql";
import { Env } from "@/env";

const Toast = dynamic(() => import("@/components/common/toast/toast"), {
  ssr: false,
});
const Loading = dynamic(() => import("./menu/loading"), {
  ssr: false,
});
const AnalyticsLoader = dynamic(() => import("@/components/analytics"), {
  ssr: false,
});

const Modal = dynamic(
  () => import("@/components/theme_custom/components/common/PromoModal"),
  {
    ssr: false,
  }
);

const karla_online_ordering = Karla({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-online-ordering",
  display: "swap",
});

const rubik = Rubik({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

const bebas = Bebas_Neue({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-secondary",
  display: "swap",
});

interface PromoData {
  _id: string;
  status: boolean;
  content: {
    title: string;
    description: string;
    image: {
      desktop: string;
      mobile: string;
    };
    button: {
      title: string;
      link: string;
    };
    isVerticallyAligned: boolean;
  };
  updatedBy: {
    creatorUser: string;
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toastData } = ToastStore();
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [promoData, setPromoData] = useState<PromoData | null>(null);
  useEffect(() => {
    const fetchPromoData = async () => {
      try {
        const response = await sdk.getCmsPromoPopUp(
          {},
          { Authorization: Env.NEXT_PUBLIC_RESTAURANT_ID }
        );
        if (response && response.getCmsPromoPopUp?.status) {
          const popup = getCookie("popup");
          if (popup) {
            return;
          }

          const resp = response.getCmsPromoPopUp;
          setPromoData({
            _id: resp._id,
            status: resp.status,
            content: {
              title: resp.content?.title ?? "",
              description: resp.content?.description ?? "",
              image: {
                desktop: resp.content?.image?.desktop ?? "",
                mobile: resp.content?.image?.mobile ?? "",
              },
              button: {
                title: resp.content?.button?.title ?? "",
                link: resp.content?.button?.link ?? "",
              },
              isVerticallyAligned: resp.content?.isVerticallyAligned ?? false,
            },
            updatedBy: {
              creatorUser: resp.updatedBy?.creatorUser ?? "",
            },
          });

          setTimeout(() => {
            setShowPopup(true);
            setCookie("popup", "true", 3600);
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching promo popup:", error);
      }
    };

    if (typeof window !== "undefined") {
      fetchPromoData();
    }
  }, []);
  return (
    <html lang="en" className={`${rubik.variable} ${bebas.variable}`}>
      <head>
        <link rel="icon" href={process.env.NEXT_PUBLIC_FAVICON_URL} />
      </head>
      <body
        className={`${karla_online_ordering.variable}`}
        style={{
          scrollBehavior: "smooth",
        }}
      >
        <Toaster
          position="top-center"
          containerStyle={{
            position: "sticky",
            top: 80,
            right: 20,
          }}
        />
        <Suspense fallback={<Loading />}>
          {
            <>
              <NextTopLoader color="#fff" showSpinner={false} />
              {promoData && (
                <Modal
                  isOpen={showPopup}
                  onClose={() => setShowPopup(false)}
                  title={promoData.content.title}
                  description={promoData.content.description}
                  button={{
                    text: promoData.content.button.title,
                    url: promoData.content.button.link,
                  }}
                  image={{
                    desktop: promoData.content.image.desktop,
                    mobile: promoData.content.image.mobile,
                  }}
                  isVerticallyAligned={promoData.content.isVerticallyAligned}
                />
              )}
              {children}
              <AnalyticsLoader />
            </>
          }
        </Suspense>
      </body>

      {toastData && <Toast message={toastData.message} type={toastData.type} />}
    </html>
  );
}
