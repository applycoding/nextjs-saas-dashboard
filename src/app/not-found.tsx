import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-screen max-w-lg place-content-center gap-3 px-4">
      <h1 className="text-2xl font-medium">Page not found</h1>
      <p className="text-sm text-muted-foreground">That route is not part of this demo.</p>
      <Link href="/" className="text-sm underline">
        Back to Signalboard
      </Link>
    </div>
  );
}
