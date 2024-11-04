import { defineConfig } from "vite";

export default defineConfig ({
    build: {
        rollupOptions: {
            output: {
                entryFileNames: 'script.js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name & assetInfo.name.endsWith(".css")) {
                        return 'styles.css';
                    }
                    return '[name].[extname]';
                },
                chunkFileNames: '[name].js'
            }
        }
    }
})