import { createMuiTheme } from "@material-ui/core";

export const lightTheme = createMuiTheme({

	palette: {
		primary: {
			main: "#F2A52B",
			contrastText: "#000"
		},
		secondary: {
			main: "#000",
			contrastText: "#fff",
		},
		text: {
			primary: "#000"
		},
		background: {
			default: "#f9f9f9",
		},
		grey: {
			800: '#eee'
		}
	},

	shadows: [
		"none",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
		"0px 0px 12px rgba(0,0,0,0.05)",
	],
	typography: {
		// fontSize: 16,
		fontFamily: "'IBM Plex Sans'",
		// h1: { fontSize: "1.8rem", fontWeight: 700 },
		// h2: { fontFamily: "'Press Start 2P'", fontSize: "2rem" },
		// h3: { fontFamily: "'Press Start 2P'", fontSize: "1.8rem" },
		// h4: { fontFamily: "'Press Start 2P'", fontSize: "1rem" },
		h5: { fontWeight: 500 },
		body1: { fontWeight: 500 },
		// h6: { fontFamily: "'Press Start 2P'" },
	},
	overrides: {
		MuiTooltip: {
			tooltip: {
				fontSize: "1em",
				// fontWeight: 400,
				// lineHeight: "1.8rem",
				backgroundColor: "#000",
				color: "#fff",
				padding: ".8rem 1rem",
				maxWidth: "30rem",
				textTransform: "none",
				// borderRadius: 10,
			},
			arrow: {
				color: "#000",
			},
		},

		MuiButton: {
			root: {
				// textTransform: "none"
			},

			containedPrimary: {
				// boxShadow: "inset 2px 2px 0 rgba(255,225,183,0.25), inset -2px -2px 0 rgba(57,18,0,0.2)"
				// backgroundImage: `url(${require('../assets/8bit/button.png')})`,
				backgroundPosition: "center center",
				backgroundSize: "cover",
			},
			containedSecondary: {
				// boxShadow: "inset 2px 2px 0 rgba(255,225,183,0.25), inset -2px -2px 0 rgba(57,18,0,0.2)"
				// backgroundImage: `url(${require('../assets/8bit/button_dark.png')})`,
				backgroundPosition: "center center",
				backgroundSize: "cover",
			},

		},
	},
	shape: {
		borderRadius: 12,
	},
});