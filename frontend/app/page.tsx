"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Medicine = {
  id: string;
  name: string;
  brand_name?: string;
};

type CompareResult = {
  brand_medicine: {
    name: string;
    price: number | null;
    salt: string;
    strength: string;
  };
  cheapest_alternative: {
    name: string;
    price: number;
  } | null;
  savings: number | null;
  savings_percent: number | null;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [comparison, setComparison] = useState<CompareResult | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const searchMedicine = async () => {
    if (!query.trim()) return;

    setLoading(true);

    const res = await fetch(
      `http://127.0.0.1:8000/medicines/search?q=${query}`
    );

    const data = await res.json();

    setResults(data);
    setComparison(null);
    setSelectedMedicine(null);

    setLoading(false);
  };

  const compareMedicine = async (medicineId: string) => {
    const res = await fetch(
      `http://127.0.0.1:8000/medicines/${medicineId}/compare`
    );
    const data = await res.json();
    setComparison(data);
    setSelectedMedicine(medicineId);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* <div className="text-2xl font-bold text-slate-900">PharmaLens</div> */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="PharmaLens Logo"
              // width={188}
              width={160}
              // height={40}
              height={36}
              priority
            />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            {/* <a href="#" className="transition hover:text-blue-600">
              Home
            </a> */}
            <Link
              href="/"
              className={`pb-1 border-b-2 ${pathname === "/" ? "border-blue-600 text-blue-600" : "border-transparent"
                }`}
            >
              Home
            </Link>
            {/* <a href="#" className="transition hover:text-blue-600">
              About
            </a> */}
            <Link
              href="/about"
              className={`pb-1 border-b-2 ${pathname === "/about" ? "border-blue-600 text-blue-600" : "border-transparent"
                }`}
            >
              About
            </Link>
            {/* <a href="#" className="transition hover:text-blue-600">
              Contact
            </a> */}
            <Link
              href="/contact"
              className={`pb-1 border-b-2 ${pathname === "/contact" ? "border-blue-600 text-blue-600" : "border-transparent"
                }`}
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            Medicine Price Transparency
          </div>

          <h1 className="mt-6 text-5xl font-bold tracking-tight">
            PharmaLens
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Search branded medicines, discover cheaper generic alternatives,
            and estimate how much you can save.
          </p>
        </div>

        <div className="mx-auto mt-10 flex max-w-2xl gap-3">
          <input
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="Search medicine... e.g. Crocin, Dolo, Paracetamol"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchMedicine();
            }}
          />

          <button
            onClick={searchMedicine}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Search Results</h2>

            <div className="space-y-3">
              {results.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500 shadow-sm">
                  No results yet. Search for a medicine to begin.
                </div>
              ) : (
                results.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => compareMedicine(med.id)}
                    className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md ${selectedMedicine === med.id
                      ? "border-blue-500 ring-2 ring-blue-100"
                      : "border-slate-200"
                      }`}
                  >
                    <div className="text-lg font-semibold">{med.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      Click to compare prices
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Comparison</h2>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {!comparison ? (
                <div className="text-slate-500">
                  Select a medicine from the search results to view price
                  comparison and savings.
                </div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold">
                    {comparison.brand_medicine.name}
                  </h3>

                  <div className="mt-2 text-sm text-slate-500">
                    Salt: {comparison.brand_medicine.salt} • Strength:{" "}
                    {comparison.brand_medicine.strength}
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <div className="text-sm text-slate-500">Brand Price</div>
                      <div className="mt-2 text-2xl font-bold">
                        ₹
                        {comparison.brand_medicine.price !== null
                          ? comparison.brand_medicine.price
                          : "N/A"}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-green-50 p-4">
                      <div className="text-sm text-green-700">
                        Cheapest Alternative
                      </div>
                      <div className="mt-2 text-lg font-semibold">
                        {comparison.cheapest_alternative
                          ? comparison.cheapest_alternative.name
                          : "Not available"}
                      </div>
                      <div className="mt-1 text-2xl font-bold text-green-700">
                        {comparison.cheapest_alternative
                          ? `₹${comparison.cheapest_alternative.price}`
                          : "--"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-4">
                    {comparison.cheapest_alternative ? (
                      <>
                        <div className="text-sm text-slate-500">
                          Estimated Savings
                        </div>
                        <div className="mt-2 text-3xl font-bold text-green-600">
                          ₹{comparison.savings}
                        </div>
                        <div className="mt-1 text-sm font-medium text-green-700">
                          You save {comparison.savings_percent}% compared to the
                          selected brand.
                        </div>
                      </>
                    ) : (
                      <div className="text-base font-medium text-red-600">
                        No cheaper alternative found.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col gap-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">PharmaLens</p>
              <p>
                A medicine price transparency platform for finding cheaper
                generic alternatives.
              </p>
            </div>

            <div className="text-sm text-slate-500">
              Built with Next.js, FastAPI, PostgreSQL, and SQLAlchemy
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400">
            © 2026 PharmaLens. Academic portfolio project.
          </div>
        </div>
      </footer>
    </main>
  );
}