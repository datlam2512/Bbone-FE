import { Link } from 'react-router-dom'
import { publicPhone } from '@/shared/lib/contact'
import { Hospital, MapPin, Star } from 'lucide-react'
import MediaImage from '@/shared/components/ui/MediaImage'

export default function ClinicCardContent({ item }) {
  const { clinic, images, rating } = item
  if (item.sourceUrl) {
    return (
      <section className="space-y-3">
        <figure className="grid aspect-video place-items-center rounded-md bg-brand-50 text-brand-700">
          <Hospital size={36} aria-hidden="true" />
        </figure>
        <h2 className="text-lg font-semibold">{clinic.name}</h2>
        <p className="flex gap-2 text-sm leading-7 text-slate-600">
          <MapPin size={17} className="mt-1 shrink-0" />
          {clinic.address}
        </p>
        <footer className="flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
          {clinic.phone && <a href={'tel:' + clinic.phone}>Gọi {clinic.phone}</a>}
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Trang bệnh viện ↗
          </a>
        </footer>
      </section>
    )
  }
  return (
    <>
      <MediaImage
        src={images?.[0]}
        alt={'Không gian minh họa ' + clinic.name}
        className="mb-5 aspect-[16/10]"
      />
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">
          <Link to={'/phong-kham/' + clinic.id} className="hover:text-brand-600">
            {clinic.name}
          </Link>
        </h2>
        {rating != null && (
          <span className="inline-flex items-center gap-1 text-sm text-amber-600">
            <Star size={15} />
            {rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-3 flex gap-2 text-sm leading-7 text-slate-500">
        <MapPin size={17} className="mt-1 shrink-0" />
        {clinic.address}
      </p>
      {publicPhone(clinic.phone) && (
        <p className="mt-3 text-sm text-brand-600">{publicPhone(clinic.phone)}</p>
      )}
    </>
  )
}
