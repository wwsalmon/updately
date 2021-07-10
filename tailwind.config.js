module.exports = {
    purge: [
        './**/*.html',
        './**/*.tsx',
    ],
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            borderColor: ['focus-visible'],
            borderWidth: ['focus-visible'],
        },   
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
    darkMode: 'class',
}