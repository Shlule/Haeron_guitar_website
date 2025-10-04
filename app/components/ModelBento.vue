<script lang="ts" setup>
const router = useRouter()
function go() {
  router.push(`/starlight`)
}
</script>

<template>
  <div>
    <section h-full w-full>
      <div class="py-12 gap-6 grid grid-cols-1 w-full md:py-16 lg:gap-9">
        <div class="mx-auto gap-12 grid grid-cols-1 w-full max-w-screen-2xl lg:gap-24">
          <div class="gap-4 grid grid-cols-1 h-auto w-full lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2">
            <div col-span-2 />
            <div class="group rounded-xl flex justify-center relative overflow-hidden sm:col-span-2" cursor-pointer @click="go()">
              <img
                src="/images/Photo_guitar_electrique_aluminium_haeron_guitar_model_starlight_bleu_partie_gauche.JPG"
                class="w-full duration-1000 ease-in-out object-cover object-[90%_0%] group-hover:scale-125"
                alt="Guitare en bois"
              >
              <div class="text-white py-10 flex flex-col items-center inset-0 justify-between absolute">
                <h2 class="text-4xl font-bold">
                  StarLight
                </h2>
                <span class="mb-5%" underline>LEARN MORE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style>

</style>
