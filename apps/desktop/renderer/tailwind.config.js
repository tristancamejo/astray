module.exports = {
	content: ['./renderer/pages/**/*.{js,ts,jsx,tsx}', './renderer/components/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'media',
	theme: {
		extend: {},
	},
	variants: {
		extend: {
			// ...
			animation: ['hover', 'focus'],
		},
	},
	plugins: [],
};
