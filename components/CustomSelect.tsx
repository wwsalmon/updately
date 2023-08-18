import { useTheme } from 'next-themes';
import Select from 'react-select'

export const getCustomStyles = (theme) => ({
	option: (provided, state) => {
		const optionBackgroundColor = state.isSelected
			? 'rgb(38, 132, 255)' /* default */
			: theme === 'dark'
			? '#000'
			: '#FFF';

		return {
			...provided,
			padding: 8,
			paddingRight: 16,
			paddingLeft: 16,
			backgroundColor: optionBackgroundColor,

			':hover': {
				backgroundColor: state.isSelected
					? optionBackgroundColor
					: theme === 'dark'
					? 'rgba(243, 244, 246, 0.2)'
					: 'rgba(243, 244, 246, 1)', // tailwind gray 100, just like moremenu on hover
			},
		};
	},

	valueContainer: provided => ({
		...provided,
		padding: 8,
		paddingRight: 16,
		paddingLeft: 16,
	}),

	control: provided => ({
		...provided,
		borderColor: '#e5e7eb',
		backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0)' : '#FFF',
	}),

	container: provided => ({
		...provided,
		marginBottom: 8,
	}),

	menu: provided => ({
		...provided,
		backgroundColor: theme === 'dark' ? '#000' : '#FFF',
	}),

	singleValue: provided => ({
		...provided,
		color: theme === 'dark' ? '#FFF' : '#000',
	}),
});

export default function CustomSelect(props) {
	const { theme, setTheme } = useTheme();
	const customStyles = getCustomStyles(theme);
	return <Select {...props} customStyles={customStyles} />
}
