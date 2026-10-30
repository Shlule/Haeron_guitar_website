<script lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// modèles déjà téléchargés, gardés le temps de la visite : revenir sur un produit ne recharge rien
const models = new Map<string, Promise<THREE.Object3D>>()

function fetchModel(url: string) {
  let model = models.get(url)
  if (!model) {
    model = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url).then(gltf => gltf.scene)
    model.catch(() => models.delete(url)) // un échec pourra être retenté
    models.set(url, model)
  }
  return model
}

/** Télécharge et prépare un modèle à l'avance (survol d'un produit dans la boutique). */
export function preloadModel(url: string) {
  fetchModel(url).catch(() => {})
}
</script>

<script setup lang="ts">
/*
 * Scène 3D du configurateur : charge le modèle 3D du produit (un objet par PartModel, nommé comme lui),
 * affiche la pièce choisie pour chaque composant et lui applique la finition choisie (voir configuratorFinishes).
 * En dev, sans modèle, une guitare provisoire prend sa place ; sinon on émet `unavailable`.
 * L'image n'est recalculée que quand quelque chose bouge (rotation, changement de finition, taille).
 */
const props = defineProps<{ modelUrl?: string }>()
const emit = defineEmits<{ unavailable: [], ready: [] }>()

const store = useConfiguratorStore()
const container = ref<HTMLDivElement>()

// PartModel des pièces du configurateur : { body_sup: ['body_sup_alpha', ...] }
const partModelsByComponent = computed(() => Object.fromEntries(store.components
  .filter(component => component.type === 'custom_piece')
  .map(component => [component.key, component.part_models.map(pm => pm.name)])))

// pour chaque composant : le PartModel affiché (choisi, sinon le premier) et sa finition
const pieces = computed(() => Object.entries(partModelsByComponent.value).map(([key, names]) => {
  const shown = store.partModelOf(key)?.name ?? names[0]
  const choices = store.answeredOptions(key).map(item => ({ option: item.option, value: item.value.value }))
  return { key, names, shown, finish: finishOf(key, choices) }
}))

let renderer: THREE.WebGLRenderer | undefined
let controls: OrbitControls | undefined
let frame = 0
let requestRender = () => {}
let resizeObserver: ResizeObserver | undefined

// un matériau par objet teinté, avec la finition visée vers laquelle il glisse à chaque image
interface Tinted { material: THREE.MeshPhysicalMaterial, target: { color: THREE.Color, metalness: number, roughness: number, clearcoat: number } | null }
const objects = new Map<string, THREE.Object3D>()
const tinted = new Map<string, Tinted>()

function tintableMaterial(object: THREE.Object3D) {
  // garde le relief du modèle (normal map, occlusion) mais remplace couleur, métal et rugosité
  let source: THREE.MeshStandardMaterial | undefined
  object.traverse((child) => {
    if (!source && child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
      source = child.material
  })
  const material = new THREE.MeshPhysicalMaterial({ clearcoatRoughness: 0.08 })
  if (source) {
    material.normalMap = source.normalMap
    material.normalScale.copy(source.normalScale)
    material.aoMap = source.aoMap
  }
  return material
}

function applyPieces() {
  for (const piece of pieces.value) {
    for (const name of piece.names) {
      const object = objects.get(name)
      if (!object)
        continue
      object.visible = name === piece.shown
      if (!piece.finish)
        continue
      let entry = tinted.get(name)
      if (!entry) {
        const material = tintableMaterial(object)
        object.traverse((child) => {
          if (child instanceof THREE.Mesh)
            child.material = material
        })
        entry = { material, target: null }
        tinted.set(name, entry)
        // première finition : appliquée directement, sans transition
        material.color.set(piece.finish.color)
        material.metalness = piece.finish.metalness
        material.roughness = piece.finish.roughness
        material.clearcoat = piece.finish.clearcoat
      }
      entry.target = { ...piece.finish, color: new THREE.Color(piece.finish.color) }
    }
  }
}

// transition douce entre deux finitions ; renvoie true tant qu'une finition n'est pas arrivée
function easeMaterials() {
  let moving = false
  for (const entry of tinted.values()) {
    const { material, target } = entry
    if (!target)
      continue
    material.color.lerp(target.color, 0.12)
    material.metalness += (target.metalness - material.metalness) * 0.12
    material.roughness += (target.roughness - material.roughness) * 0.12
    material.clearcoat += (target.clearcoat - material.clearcoat) * 0.12
    const gap = Math.abs(target.metalness - material.metalness) + Math.abs(target.roughness - material.roughness)
      + Math.abs(target.clearcoat - material.clearcoat)
      + Math.abs(target.color.r - material.color.r) + Math.abs(target.color.g - material.color.g) + Math.abs(target.color.b - material.color.b)
    if (gap > 0.002) {
      moving = true
    }
    else {
      material.color.copy(target.color)
      Object.assign(material, { metalness: target.metalness, roughness: target.roughness, clearcoat: target.clearcoat })
      entry.target = null
    }
  }
  return moving
}

async function loadModel(): Promise<THREE.Object3D | null> {
  try {
    if (!props.modelUrl)
      throw new Error('pas de modèle 3D')
    // copie : les objets se partagent géométries et textures, chaque scène a ses propres matériaux
    return (await fetchModel(props.modelUrl)).clone(true)
  }
  catch {
    return import.meta.dev ? buildPlaceholderGuitar(partModelsByComponent.value) : null
  }
}

// cadre la guitare entière, vue légèrement de trois quarts
function frameModel(model: THREE.Object3D, camera: THREE.PerspectiveCamera) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const fit = Math.max(size.y, size.x / camera.aspect) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const distance = fit * 1.15
  camera.position.copy(center).add(new THREE.Vector3(distance * 0.35, distance * 0.05, distance * 0.94))
  camera.near = distance / 100
  camera.far = distance * 10
  camera.updateProjectionMatrix()
  controls!.target.copy(center)
  controls!.minDistance = distance * 0.35
  controls!.maxDistance = distance * 1.6
  controls!.update()
}

onMounted(async () => {
  const element = container.value!
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  }
  catch {
    emit('unavailable') // pas de WebGL
    return
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  element.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  // reflets de studio pour les métaux
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  const light = new THREE.DirectionalLight('#ffffff', 1.2)
  light.position.set(1, 2, 3)
  scene.add(light)

  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100)
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = element
    if (!width || !height)
      return
    renderer!.setSize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    requestRender()
  }
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(element)

  const model = await loadModel()
  if (!renderer)
    return // démonté pendant le chargement
  if (!model) {
    emit('unavailable')
    return
  }
  model.traverse((child) => {
    if (child.name)
      objects.set(child.name, child)
  })
  scene.add(model)
  applyPieces()
  frameModel(model, camera)

  // une image par frame seulement tant que la guitare tourne (inertie) ou change de finition
  const render = () => {
    frame = 0
    const moving = controls!.update()
    const easing = easeMaterials()
    renderer!.render(scene, camera)
    if (moving || easing)
      requestRender()
  }
  requestRender = () => {
    if (!frame && renderer)
      frame = requestAnimationFrame(render)
  }
  controls.addEventListener('change', requestRender)
  render()
  emit('ready')
})

watch(pieces, () => {
  applyPieces()
  requestRender()
}, { deep: true })

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  resizeObserver?.disconnect()
  controls?.dispose()
  for (const { material } of tinted.values())
    material.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = undefined
})
</script>

<template>
  <div ref="container" class="config-scene h-full w-full cursor-grab active:cursor-grabbing" />
</template>
