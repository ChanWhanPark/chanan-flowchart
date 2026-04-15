import { jsPDF } from 'jspdf'

function getSvgElement(container: HTMLDivElement): SVGSVGElement | null {
  return container.querySelector('svg')
}

/** SVG의 실제 콘텐츠 크기를 viewBox에서 추출 */
function getSvgDimensions(svg: SVGSVGElement): { width: number; height: number } {
  const vb = svg.getAttribute('viewBox')
  if (vb) {
    const parts = vb.split(/[\s,]+/).map(Number)
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      return { width: parts[2], height: parts[3] }
    }
  }
  const w = parseFloat(svg.getAttribute('width') || '0')
  const h = parseFloat(svg.getAttribute('height') || '0')
  if (w && h) return { width: w, height: h }
  const rect = svg.getBoundingClientRect()
  return { width: rect.width, height: rect.height }
}

function svgToCanvas(
  svg: SVGSVGElement,
  scale = 2,
): Promise<{ canvas: HTMLCanvasElement; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const { width, height } = getSvgDimensions(svg)
    const clone = svg.cloneNode(true) as SVGSVGElement

    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))
    if (!clone.getAttribute('viewBox')) {
      clone.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }

    // <style> 내 외부 URL만 제거 (스타일 규칙 자체는 유지)
    clone.querySelectorAll('style').forEach((style) => {
      let css = style.textContent ?? ''
      css = css.replace(/@import\s[^;]+;/g, '')
      css = css.replace(/@font-face\s*\{[^}]*\}/g, '')
      // 내부 참조(#id)는 유지, 외부 URL만 제거
      css = css.replace(/url\(\s*["']?https?:\/\/[^)]*\)/gi, 'none')
      style.textContent = css
    })

    // 외부 리소스 참조 요소 제거
    clone.querySelectorAll('image[href^="http"], use[href^="http"]').forEach((el) => el.remove())

    // 흰 배경
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    bg.setAttribute('width', '100%')
    bg.setAttribute('height', '100%')
    bg.setAttribute('fill', 'white')
    clone.insertBefore(bg, clone.firstChild)

    const markup = new XMLSerializer().serializeToString(clone)
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(markup)))

    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')!
    ctx.scale(scale, scale)

    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height)
      resolve({ canvas, width, height })
    }
    img.onerror = (e) => reject(e)
    img.src = dataUrl
  })
}

export async function downloadPng(container: HTMLDivElement, filename = 'flowchart.png') {
  const svg = getSvgElement(container)
  if (!svg) return

  const { canvas } = await svgToCanvas(svg)
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export async function downloadPdf(container: HTMLDivElement, filename = 'flowchart.pdf') {
  const svg = getSvgElement(container)
  if (!svg) return

  const { canvas, width, height } = await svgToCanvas(svg)
  const orientation = width > height ? 'landscape' : 'portrait'
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height], hotfixes: ['px_scaling'] })
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height)
  pdf.save(filename)
}
