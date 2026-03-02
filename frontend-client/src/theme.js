import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#6d28d9',
        },
        secondary: { main: '#06b6d4' },
        success: { main: '#10b981' },
        warning: { main: '#f59e0b' },
        error: { main: '#ef4444' },
        background: {
            default: '#0d0d14',
            paper: '#13131f',
        },
        text: {
            primary: '#e2e8f0',
            secondary: '#64748b',
        },
        divider: 'rgba(255,255,255,0.06)',
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.03em' },
        h2: { fontWeight: 800, letterSpacing: '-0.02em' },
        h3: { fontWeight: 700, letterSpacing: '-0.02em' },
        h4: { fontWeight: 700, letterSpacing: '-0.01em' },
        h5: { fontWeight: 600, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600 },
        button: { fontWeight: 600, textTransform: 'none', letterSpacing: '-0.01em' },
        body1: { lineHeight: 1.7 },
        body2: { lineHeight: 1.6 },
    },
    shape: { borderRadius: 6 },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    textTransform: 'none',
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                },
                containedPrimary: {
                    background: '#7c3aed',
                    '&:hover': { background: '#6d28d9' },
                },
                outlinedPrimary: {
                    borderColor: 'rgba(124,58,237,0.4)',
                    color: '#a78bfa',
                    '&:hover': { borderColor: '#7c3aed', background: 'rgba(124,58,237,0.08)' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    background: '#13131f',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: 'none',
                    backgroundImage: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    backgroundImage: 'none',
                    boxShadow: 'none',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.03)',
                        fontSize: '0.9rem',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                        '&.Mui-focused fieldset': {
                            borderColor: '#7c3aed',
                            borderWidth: '1px',
                        },
                    },
                    '& .MuiInputLabel-root': { color: '#64748b', fontSize: '0.875rem' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#a78bfa' },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                outlined: { borderRadius: 6, fontSize: '0.9rem' },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 4, fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.02em' },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 6, border: '1px solid', fontSize: '0.875rem' },
                standardSuccess: { background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#34d399' },
                standardError: { background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#f87171' },
            },
        },
        MuiDivider: {
            styleOverrides: { root: { borderColor: 'rgba(255,255,255,0.06)' } },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: { borderRadius: 4, fontSize: '0.78rem', background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)' },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: { '& .MuiTableCell-root': { background: '#0f0f1a', borderBottom: '1px solid rgba(255,255,255,0.06)' } },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: { borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem', color: '#cbd5e1' },
            },
        },
    },
});

export default theme;
