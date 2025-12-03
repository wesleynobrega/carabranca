// babel.config.js

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            // ✅ ESSENCIAL: Ensina o Metro a resolver o alias @/
            [
                'module-resolver',
                {
                    alias: {
                        "@": "./" // Mapeia o @/ para a raiz do projeto (./)
                    },
                    // Permite que o Metro encontre arquivos sem a extensão (.js, .ts, etc.)
                    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs']
                },
            ],
            // Plugin reanimated (Deve ser sempre o último!)
            'react-native-reanimated/plugin',
        ],
    };
};