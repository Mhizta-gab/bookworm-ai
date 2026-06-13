import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bookworm AI — Where every book finds its voice",
  description:
    "Upload any PDF. Speak to it. Hear it answer back in a voice crafted just for that book. Bookworm AI is the voice-first reading companion for curious minds.",
  openGraph: {
    title: "Bookworm AI — Where every book finds its voice",
    description:
      "Real-time voice conversations with any book you upload. Powered by Vapi and ElevenLabs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ClerkProvider>{children}</ClerkProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          theme="light"
          pauseWhenPageIsHidden
          toastOptions={{
            classNames: {
              toast: "sonner-toast",
              description: "sonner-description",
              actionButton: "sonner-action-button",
              cancelButton: "sonner-cancel-button",
              closeButton: "sonner-close-button",
            },
            style: {
              fontSize: "0.92rem",
              fontWeight: 700,
              fontFamily: '"Instrument Sans", Arial, sans-serif',
              borderRadius: "4px",
              border: "2px solid #171717",
              boxShadow: "3px 3px 0 rgba(0, 0, 0, 0.35)",
              padding: "12px 16px",
            },
          }}
        />
      </body>
    </html>
  );
}
