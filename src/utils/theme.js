// Light / dark mode. The choice is saved in the browser and applied before the app draws.
const KEY = 'orban_theme'

export const initTheme = () => {
    try {
        const saved = localStorage.getItem(KEY)
        if (saved) document.documentElement.dataset.theme = saved
    } catch {
        /* storage blocked: fall back to the system setting */
    }
}

export const currentTheme = () =>
    document.documentElement.dataset.theme || (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')

export const setTheme = (theme) => {
    document.documentElement.dataset.theme = theme
    try {
        localStorage.setItem(KEY, theme)
    } catch {
        /* ignore */
    }
}
