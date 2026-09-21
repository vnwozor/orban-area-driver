// Reads a photo the driver picked and shrinks it (max 640px, JPEG) before it
// is uploaded, so profile and car photos stay small (about 50 KB).
export const readImage = (file, max = 640) =>
    new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) return reject(new Error('Choose an image file (PNG, JPG or WebP).'))
        const reader = new FileReader()
        reader.onerror = () => reject(new Error('Could not read that file.'))
        reader.onload = () => {
            const img = new Image()
            img.onerror = () => reject(new Error('Could not open that image.'))
            img.onload = () => {
                const scale = Math.min(1, max / Math.max(img.width, img.height))
                const canvas = document.createElement('canvas')
                canvas.width = Math.round(img.width * scale)
                canvas.height = Math.round(img.height * scale)
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
                resolve(canvas.toDataURL('image/jpeg', 0.82))
            }
            img.src = reader.result
        }
        reader.readAsDataURL(file)
    })
