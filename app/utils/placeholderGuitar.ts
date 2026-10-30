import * as THREE from 'three'

/*
 * Guitare provisoire faite de formes simples, utilisée en dev tant que public/models/starlight.glb n'existe pas.
 * Chaque objet porte le nom d'un PartModel, comme le fera le vrai modèle exporté de Blender.
 * Les formes reprennent le schéma 2D (viewBox 400 × 900, environ 1 m de haut).
 */

const SCALE = 0.0011
const x = (value: number) => (value - 200) * SCALE
const y = (value: number) => (450 - value) * SCALE

// tracé SVG simplifié : M, C et L uniquement
function shapeFromPath(path: string) {
  const shape = new THREE.Shape()
  const tokens = path.match(/[MCLZ]|-?\d+(?:\.\d+)?/g) ?? []
  let command = ''
  const numbers: number[] = []
  const flush = () => {
    if (command === 'M')
      shape.moveTo(x(numbers[0]!), y(numbers[1]!))
    else if (command === 'L')
      shape.lineTo(x(numbers[0]!), y(numbers[1]!))
    else if (command === 'C')
      shape.bezierCurveTo(x(numbers[0]!), y(numbers[1]!), x(numbers[2]!), y(numbers[3]!), x(numbers[4]!), y(numbers[5]!))
    numbers.length = 0
  }
  for (const token of tokens) {
    if (/[MCLZ]/.test(token)) {
      command = token
    }
    else {
      numbers.push(Number(token))
      if ((command === 'C' && numbers.length === 6) || (command !== 'C' && numbers.length === 2))
        flush()
    }
  }
  // le tracé revient sur son point de départ : ce point en double casse le biseau de l'extrusion
  const points = shape.getPoints(48)
  if (points.length > 1 && points[0]!.distanceTo(points.at(-1)!) < 1e-6)
    points.pop()
  return new THREE.Shape(points)
}

function roundedRect(left: number, top: number, width: number, height: number, radius: number) {
  const shape = new THREE.Shape()
  const [l, r, t, b, rad] = [x(left), x(left + width), y(top), y(top + height), radius * SCALE]
  shape.moveTo(l + rad, b)
  shape.lineTo(r - rad, b)
  shape.quadraticCurveTo(r, b, r, b + rad)
  shape.lineTo(r, t - rad)
  shape.quadraticCurveTo(r, t, r - rad, t)
  shape.lineTo(l + rad, t)
  shape.quadraticCurveTo(l, t, l, t - rad)
  shape.lineTo(l, b + rad)
  shape.quadraticCurveTo(l, b, l + rad, b)
  return shape
}

function extrude(shape: THREE.Shape, depth: number, z: number, material: THREE.Material) {
  const bevel = Math.min(0.004, depth / 4)
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 48 })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.z = z
  return mesh
}

// forme de chaque type de pièce
const builders: Record<string, () => THREE.Mesh> = {
  body_sup: () => extrude(shapeFromPath('M140 470 C100 500 90 560 120 600 L280 600 C310 560 300 500 260 470 C240 455 160 455 140 470 Z'), 0.04, 0, new THREE.MeshStandardMaterial()),
  body_inf: () => extrude(shapeFromPath('M120 600 C70 660 70 800 150 850 C190 875 210 875 250 850 C330 800 330 660 280 600 Z'), 0.04, 0, new THREE.MeshStandardMaterial()),
  neck: () => extrude(roundedRect(182, 30, 36, 470, 10), 0.022, 0.012, new THREE.MeshStandardMaterial({ color: '#c69c6d', roughness: 0.6 })),
  fingerboard: () => extrude(roundedRect(187, 40, 26, 420, 4), 0.006, 0.038, new THREE.MeshStandardMaterial({ color: '#3b2a20', roughness: 0.7 })),
  mic_plate: () => extrude(roundedRect(165, 540, 70, 110, 8), 0.004, 0.046, new THREE.MeshStandardMaterial()),
}

/** Une pièce par PartModel du configurateur ({ composant: [noms des PartModel] }). */
export function buildPlaceholderGuitar(partModelsByComponent: Record<string, string[]>) {
  const guitar = new THREE.Group()
  for (const [component, names] of Object.entries(partModelsByComponent)) {
    const build = builders[component]
    if (!build)
      continue
    for (const name of names) {
      const mesh = build()
      mesh.name = name
      guitar.add(mesh)
    }
  }
  return guitar
}
