interface Bubble {
  x: number
  y: number
  size: number
  speed: number
  wobblePhase: number
}

interface Seaweed {
  x: number
  height: number
  segments: number
  hue: number
}

let bubbles: Bubble[] = []
let seaweeds: Seaweed[] = []
let lastWidth = 0
let lastHeight = 0

function initScene(width: number, height: number, floorY: number): void {
  bubbles = []
  seaweeds = []

  // Bubbles
  for (let i = 0; i < 25; i++) {
    bubbles.push({
      x: Math.random() * width,
      y: floorY - Math.random() * (floorY - 40),
      size: Math.random() * 4 + 1.5,
      speed: Math.random() * 20 + 10,
      wobblePhase: Math.random() * Math.PI * 2,
    })
  }

  // Seaweed patches
  const count = Math.floor(width / 120) + 2
  for (let i = 0; i < count; i++) {
    seaweeds.push({
      x: Math.random() * width,
      height: 40 + Math.random() * 60,
      segments: 4 + Math.floor(Math.random() * 3),
      hue: 120 + Math.random() * 40, // green to teal
    })
  }

  lastWidth = width
  lastHeight = height
}

function drawSeaweed(
  ctx: CanvasRenderingContext2D,
  sw: Seaweed,
  floorY: number,
  time: number,
): void {
  const segH = sw.height / sw.segments

  for (let s = 0; s < sw.segments; s++) {
    const baseY = floorY - s * segH
    const topY = baseY - segH
    const sway = Math.sin(time * 0.8 + s * 0.5 + sw.x * 0.01) * (4 + s * 2)

    ctx.beginPath()
    ctx.moveTo(sw.x, baseY)
    ctx.quadraticCurveTo(sw.x + sway, (baseY + topY) / 2, sw.x + sway * 0.7, topY)
    ctx.strokeStyle = `hsla(${sw.hue}, 50%, ${30 + s * 5}%, 0.6)`
    ctx.lineWidth = 4 - s * 0.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  floorY: number,
): void {
  if (lastWidth !== width || lastHeight !== height) {
    initScene(width, height, floorY)
  }

  // Ocean gradient
  const waterGradient = ctx.createLinearGradient(0, 0, 0, height)
  waterGradient.addColorStop(0, '#0a3d5c')
  waterGradient.addColorStop(0.3, '#0c4a6e')
  waterGradient.addColorStop(0.6, '#0e3558')
  waterGradient.addColorStop(1, '#071e3d')
  ctx.fillStyle = waterGradient
  ctx.fillRect(0, 0, width, height)

  // Light rays from surface
  drawLightRays(ctx, width, time)

  // Seaweed (behind lobsters)
  for (const sw of seaweeds) {
    drawSeaweed(ctx, sw, floorY, time)
  }

  // Sandy floor
  const floorGradient = ctx.createLinearGradient(0, floorY - 8, 0, height)
  floorGradient.addColorStop(0, '#3a6070')
  floorGradient.addColorStop(0.05, '#8a7b60')
  floorGradient.addColorStop(0.3, '#7a6b50')
  floorGradient.addColorStop(1, '#5a4b3a')
  ctx.fillStyle = floorGradient
  ctx.fillRect(0, floorY, width, height - floorY)

  // Sand texture (small dots)
  for (let i = 0; i < 60; i++) {
    const sx = (i * 31.7 + 17) % width
    const sy = floorY + 4 + ((i * 23.3 + 7) % (height - floorY - 8))
    ctx.beginPath()
    ctx.arc(sx, sy, 1, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(180, 160, 120, 0.15)'
    ctx.fill()
  }

  // Bubbles (rising)
  for (const bubble of bubbles) {
    bubble.y -= bubble.speed * (1 / 60)
    const wobble = Math.sin(time * 2 + bubble.wobblePhase) * 3

    if (bubble.y < -10) {
      bubble.y = floorY - 5
      bubble.x = Math.random() * width
    }

    ctx.beginPath()
    ctx.arc(bubble.x + wobble, bubble.y, bubble.size, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(150, 210, 255, 0.15)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(180, 220, 255, 0.2)'
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
}

function drawLightRays(ctx: CanvasRenderingContext2D, width: number, time: number): void {
  const rayCount = 5
  for (let i = 0; i < rayCount; i++) {
    const baseX = (width / (rayCount + 1)) * (i + 1)
    const sway = Math.sin(time * 0.3 + i * 1.2) * 30

    ctx.save()
    ctx.globalAlpha = 0.03 + Math.sin(time * 0.5 + i) * 0.01
    ctx.beginPath()
    ctx.moveTo(baseX + sway - 20, 0)
    ctx.lineTo(baseX + sway + 20, 0)
    ctx.lineTo(baseX + sway + 60, 500)
    ctx.lineTo(baseX + sway - 60, 500)
    ctx.closePath()
    ctx.fillStyle = '#7ec8e3'
    ctx.fill()
    ctx.restore()
  }
}

export function resetScene(): void {
  lastWidth = 0
  lastHeight = 0
  bubbles = []
  seaweeds = []
}
