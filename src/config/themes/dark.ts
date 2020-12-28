import { createMuiTheme } from "@material-ui/core";

export const darkTheme = createMuiTheme({
	palette: {
		type: 'dark',
		primary: { main: "#F2A52B" },
		background: {
			default: "#181818",
			paper: "#2b2b2b"
		},
		grey: {
			800: '#2b2b2b'
		}
	},
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
	shape: {
		borderRadius: 8
	},
	overrides: {
		MuiTooltip: {
			tooltip: {
				fontSize: "1rem",
			}
		},
		MuiDrawer: {
			paper: {
				// background: "#121212",
			},
			paperAnchorDockedLeft: {
				borderRight: 0
			}
		}
	}
});