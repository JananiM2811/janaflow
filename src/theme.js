// Grey / white / black only. Layout follows the FinWise Figma design; token names are
// kept from that design so every screen picks up the palette from here.
const LIGHT = {
  primary: '#27272A', // buttons, active pills (white text on it)
  header: '#3F3F46', // charcoal header band (white text on it)
  honeydew: '#FFFFFF', // sheet background
  surface: '#FFFFFF', // cards, popovers, tab bar
  lightGreen: '#F4F4F5', // inputs, chips, soft cards
  border: '#E4E4E7',
  dark: '#09090B',
  fence: '#18181B', // main text
  cyprus: '#52525B', // raised elements on the header, neutral buttons
  oceanBlue: '#3F3F46', // secondary emphasis text
  vividBlue: '#52525B',
  lightBlue: '#A1A1AA',
  white: '#FFFFFF',
  muted: '#71717A',
  onHeader: '#D4D4D8', // secondary text on the header
  income: '#18181B', // income is solid, expense is softer grey
  expense: '#71717A',
  danger: '#18181B',
  warning: '#52525B',
  heat: '63,63,70', // rgb used for calendar spending intensity
};

const DARK = {
  primary: '#52525B',
  header: '#18181B',
  honeydew: '#09090B',
  surface: '#18181B',
  lightGreen: '#27272A',
  border: '#3F3F46',
  dark: '#000000',
  fence: '#FAFAFA',
  cyprus: '#52525B',
  oceanBlue: '#D4D4D8',
  vividBlue: '#71717A',
  lightBlue: '#A1A1AA',
  white: '#FFFFFF',
  muted: '#A1A1AA',
  onHeader: '#A1A1AA',
  income: '#FAFAFA',
  expense: '#A1A1AA',
  danger: '#FAFAFA',
  warning: '#D4D4D8',
  heat: '250,250,250',
};

// Mutable palette: applyTheme swaps the values in place, so inline `colors.x` reads
// pick up the new theme on the next render.
export const colors = { ...LIGHT };

let mode = 'light';
let version = 0;

export const getThemeMode = () => mode;

export function applyTheme(next) {
  mode = next;
  Object.assign(colors, next === 'dark' ? DARK : LIGHT);
  version += 1;
}

// Drop-in for StyleSheet.create that rebuilds its styles after a theme change
export function themed(factory) {
  let cache = null;
  let builtFor = -1;
  return new Proxy(
    {},
    {
      get(_, key) {
        if (builtFor !== version) {
          cache = factory();
          builtFor = version;
        }
        return cache[key];
      },
    },
  );
}

export const fonts = {
  light: 'Poppins_300Light',
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Background colors for alert icons (white glyph on top), read live for the current theme
export const toneColors = {
  get success() {
    return colors.header;
  },
  get info() {
    return colors.vividBlue;
  },
  get warning() {
    return colors.cyprus;
  },
  get danger() {
    return colors.primary;
  },
};

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 6,
};
