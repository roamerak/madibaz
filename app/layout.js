import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Madibaz Rugby League",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
