import Script from "next/script";

/**
 * Renders nothing until NEXT_PUBLIC_GA_ID is set in the environment.
 * Add the real GA4 Measurement ID (from Google Analytics > Admin > Data
 * Streams) to .env.local / production env vars to activate tracking —
 * no code change needed.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
