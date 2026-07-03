import { useFormatter } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/products";

export function CompareTable({
  title,
  modelLabel,
  screenLabel,
  osLabel,
  priceLabel,
  products,
}: {
  title: string;
  modelLabel: string;
  screenLabel: string;
  osLabel: string;
  priceLabel: string;
  products: Product[];
}) {
  const format = useFormatter();

  return (
    <section id="compare" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                {modelLabel}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell sm:px-6">
                {screenLabel}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell sm:px-6">
                {osLabel}
              </th>
              <th scope="col" className="px-4 py-3 font-medium sm:px-6">
                {priceLabel}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.slug}>
                <td className="px-4 py-4 font-medium sm:px-6">
                  <Link href={`/products/${product.slug}`} className="hover:underline">
                    {product.name}
                  </Link>
                </td>
                <td className="hidden px-4 py-4 text-text-2 sm:table-cell sm:px-6">
                  {product.specs.screenSize}
                </td>
                <td className="hidden px-4 py-4 text-text-2 sm:table-cell sm:px-6">
                  {product.specs.os}
                </td>
                <td className="px-4 py-4 font-semibold sm:px-6">
                  {format.number(product.priceFrom, {
                    style: "currency",
                    currency: "THB",
                    maximumFractionDigits: 0,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
