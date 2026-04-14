const supportedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxPhotoDimension = 1280
const photoOutputQuality = 0.8
const maxPhotoFileSizeBytes = 12 * 1024 * 1024

export function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('Impossibile leggere la foto selezionata.'))
    }

    reader.onerror = () => {
      reject(new Error('Impossibile leggere la foto selezionata.'))
    }

    reader.readAsDataURL(blob)
  })
}

export function loadImageElement(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Impossibile elaborare la foto selezionata.'))
    image.src = source
  })
}

export function getResizedDimensions(width: number, height: number) {
  const longestSide = Math.max(width, height)

  if (longestSide <= maxPhotoDimension) {
    return { width, height }
  }

  const ratio = maxPhotoDimension / longestSide

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

export async function convertPhotoToDataUrl(file: File) {
  if (!supportedPhotoTypes.has(file.type)) {
    throw new Error('Seleziona una foto in formato JPG, PNG o WebP.')
  }

  if (file.size > maxPhotoFileSizeBytes) {
    throw new Error('La foto selezionata supera il limite di 12 MB.')
  }

  const imageUrl = URL.createObjectURL(file)

  try {
    const image = await loadImageElement(imageUrl)
    const naturalWidth = image.naturalWidth || image.width
    const naturalHeight = image.naturalHeight || image.height
    const { width, height } = getResizedDimensions(naturalWidth, naturalHeight)
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Impossibile preparare la foto per il salvataggio.')
    }

    context.fillStyle = '#0b2230'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (value) {
            resolve(value)
            return
          }

          reject(new Error('Impossibile preparare la foto per il salvataggio.'))
        },
        'image/jpeg',
        photoOutputQuality,
      )
    })

    return readBlobAsDataUrl(blob)
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}
