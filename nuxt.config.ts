// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    // 빌드 결과물이 저장될 폴더 경로를 지정합니다.
    output: {
      dir: 'featherVMC/.output', // 원하는 폴더명으로 변경 (예: 'dist', 'build/out' 등)
      serverDir: 'featherVMC/.output/server',
      publicDir: 'featherVMC/.output/public'
    }
  }
})
