export default function PageHeading({ eyebrow, title, description, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 text-xs font-bold tracking-widest text-brand-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-4 leading-7 text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  )
}
