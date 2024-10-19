import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600">
              © 2024 Shintaro Akao. All rights reserved.
            </p>
          </div>
          <nav className="flex space-x-4">
            <Link
              href="/about"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              利用規約
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
