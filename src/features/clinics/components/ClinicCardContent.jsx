import { Link } from 'react-router-dom'
import { publicPhone } from '@/shared/lib/contact'
import { MapPin, Star } from 'lucide-react'
import MediaImage from '@/shared/components/ui/MediaImage'

export default function ClinicCardContent({ item }) {
  const { clinic, images, rating } = item
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
