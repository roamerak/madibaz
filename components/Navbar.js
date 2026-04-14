import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-[#001f4d] text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src="/nmu-logo.png"
          alt="NMU Logo"
          width={50}
          height={50}
        />
        <span className="font-bold text-lg text-[#f5b800]">
          Madibaz Rugby
        </span>
      </div>

      <div className="flex gap-6">
        <Link href="/">Home</Link>
        <Link href="/fixtures">Fixtures</Link>
        <Link href="/results">Results</Link>
        <Link href="/log">Log</Link>
      </div>
    </nav>
  );
}