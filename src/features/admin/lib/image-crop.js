export function cropRectangle(width, height, aspect, zoom = 1, x = 0.5, y = 0.5) {
  const cropWidth = Math.min(width, height * aspect) / Math.max(1, zoom),
    cropHeight = cropWidth / aspect
  return {
    x: (width - cropWidth) * Math.max(0, Math.min(1, x)),
    y: (height - cropHeight) * Math.max(0, Math.min(1, y)),
    width: cropWidth,
    height: cropHeight,
  }
}
export function cropOutputSize(width, height, aspect, zoom = 1) {
  const crop = cropRectangle(width, height, aspect, zoom)
  const scale = Math.min(1, 2560 / crop.width, 2560 / crop.height)
  return {
    width: Math.max(1, Math.round(crop.width * scale)),
    height: Math.max(1, Math.round(crop.height * scale)),
  }
}
