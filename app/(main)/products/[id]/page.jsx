import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

const CONTACT = {
  phone: "+251950315508",
  phoneLabel: "+251 95 031 5508",
  telegram: "Wendawendhomegymequipment",
  instagram: "wendawendhomegym",
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SingleProduct({ params }) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) notFound();

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  if (!product) notFound();

  const contactLinks = [
    {
      label: "Call",
      value: CONTACT.phoneLabel,
      href: `tel:${CONTACT.phone}`,
      external: false,
    },
    {
      label: "Telegram",
      value: `@${CONTACT.telegram}`,
      href: `https://t.me/${CONTACT.telegram}`,
      external: true,
    },
    {
      label: "Instagram",
      value: `@${CONTACT.instagram}`,
      href: `https://instagram.com/${CONTACT.instagram}`,
      external: true,
    },
  ];

  return (
    <section className="flex min-h-svh flex-col bg-black text-white md:flex-row">
      <div className="relative h-[70svh] w-full bg-[#c3bfbf] pt-24 md:sticky md:top-0 md:h-svh md:w-2/3 md:pt-20">
        <div className="relative h-full w-full">
          {product.imageUrl && (
            <Image
              alt={product.name}
              src={product.imageUrl}
              sizes="(min-width: 768px) 66vw, 100vw"
              priority
              fill
              className="object-contain object-center"
            />
          )}
        </div>
      </div>

      <div className="flex w-full flex-col justify-center gap-10 bg-black px-6 py-12 md:w-1/3 md:px-10 md:py-24">
        <div>
          <Link
            href="/products"
            className="mb-8 inline-block font-poppins text-[10px] uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-white sm:text-[11px]"
          >
            ← Back to catalog
          </Link>

          <h1 className="mb-6 text-3xl font-semibold uppercase leading-tight md:text-4xl">
            {product.name}
          </h1>

          {product.description && (
            <p className="whitespace-pre-line font-poppins text-base leading-relaxed text-white/70">
              {product.description}
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-4 font-poppins text-[10px] uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]">
            Contact Us To Order
          </h2>

          <div className="flex flex-col gap-2">
            {contactLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                {...(item.external && {
                  target: "_blank",
                  rel: "noopener noreferrer",
                })}
                className="flex items-center justify-between gap-4 border border-zinc-600 px-4 py-4 font-poppins text-xs uppercase tracking-[0.15em] transition-colors hover:bg-zinc-800"
              >
                <span className="text-white">{item.label}</span>
                <span className="truncate text-zinc-400 normal-case tracking-normal">
                  {item.value}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
