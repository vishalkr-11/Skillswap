import { getInitials, generateAvatarColor } from '../../utils/helpers'

export default function Avatar({ name = '', src, size = 'md', online = false, className = '' }) {
  const sizes = { xs: 'w-7 h-7 text-xs', sm: 'w-9 h-9 text-sm', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-lg', xl: 'w-24 h-24 text-2xl' }
  const dotSizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3', lg: 'w-3.5 h-3.5', xl: 'w-4 h-4' }
  const sizeClass = sizes[size] || sizes.md

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover provider-avatar`} />
      ) : (
        <div
          className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-slate-900 provider-avatar`}
          style={{ background: generateAvatarColor(name) }}
        >
          {getInitials(name)}
        </div>
      )}
      {online && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-emerald-400 rounded-full border-2 border-slate-950`} />
      )}
    </div>
  )
}
