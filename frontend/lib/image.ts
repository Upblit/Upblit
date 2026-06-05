const MAX_LOGO_BYTES = 500 * 1024
const MAX_LOGO_SIZE = 512
const MAX_LOGO_QUALITY = 0.9
const MIN_LOGO_QUALITY = 0.5
const COMPRESSION_STEPS = 8

export async function prepareLogoUpload(file: File): Promise<File> {
  if (file.size <= MAX_LOGO_BYTES) {
    return file
  }

  const image = await createImageBitmap(file)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) {
    return file
  }

  const maxDimension = Math.max(image.width, image.height)
  const baseScale = Math.min(1, MAX_LOGO_SIZE / maxDimension)
  let bestBlob: Blob | null = null
  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg"

  for (let attempt = 0; attempt < COMPRESSION_STEPS; attempt += 1) {
    const stepScale = Math.max(0.5, 1 - attempt * 0.12)
    const scale = Math.max(0.1, baseScale * stepScale)
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))

    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const qualityProgress = attempt / Math.max(1, COMPRESSION_STEPS - 1)
    const quality = Math.max(
      MIN_LOGO_QUALITY,
      MAX_LOGO_QUALITY - qualityProgress * (MAX_LOGO_QUALITY - MIN_LOGO_QUALITY),
    )

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, outputType, quality)
    })

    if (blob) {
      bestBlob = blob
    }

    if (blob && blob.size <= MAX_LOGO_BYTES) {
      return new File([blob], replaceExtension(file.name, outputType), {
        type: outputType,
      })
    }
  }

  if (bestBlob) {
    return new File([bestBlob], replaceExtension(file.name, outputType), {
      type: outputType,
    })
  }

  return file
}

function replaceExtension(fileName: string, outputType: string): string {
  const extension = outputType === "image/png" ? ".png" : ".jpg"
  return fileName.replace(/\.[^.]+$/, extension)
}
