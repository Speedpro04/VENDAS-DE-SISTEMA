export const getApiUrl = (): string => {
  try {
    const saved = localStorage.getItem('sqr_config')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.api_url) {
        return parsed.api_url.replace(/\/$/, '') // Remove barra diagonal no final
      }
    }
  } catch (e) {
    console.error('Erro ao ler URL da API do localStorage:', e)
  }
  
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return envUrl.replace(/\/$/, '')
}
