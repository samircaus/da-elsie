# DA Elsie - Personal Edition

This is my personal fork and customization of the Author Kit project. Built with modern web technologies and a refreshed design system.

**🌐 Live Site:** [https://main--da-elsie--samircaus.aem.page/](https://main--da-elsie--samircaus.aem.page/)

## About This Project

This is a customized version of the Author Kit, featuring:

- **🎨 Modern Design System**: Completely refreshed color palette with contemporary blues, purples, and enhanced grays
- **✨ Enhanced UI Components**: Updated buttons, cards, hero sections, tables with modern styling
- **🌗 Improved Light/Dark Mode**: Better contrast and color schemes for both modes
- **💫 Smooth Animations**: Subtle transitions and hover effects throughout
- **📐 Enhanced Spacing**: Refined spacing scale for better visual hierarchy
- Built on AEM (Adobe Experience Manager) Edge Delivery Services

### Design Refresh Highlights

**Color Palette**:

- Primary Brand: Modern blue (`#2563eb`)
- Accent: Vibrant purple (`#9333ea`)
- Enhanced grays with better contrast
- Full color spectrum updated to Tailwind-inspired palette

**Component Updates**:

- Buttons with rounded corners, hover animations, and better shadows
- Cards with modern borders, enhanced shadows, and smooth lift effects
- Hero sections with gradient overlays and improved typography
- Tables with alternating row hover states and better readability
- Header with subtle shadow and backdrop blur
- Footer with improved contrast and hover states

## Getting Started

### Prerequisites

- Node.js and npm installed
- Git installed

### Local Development

1. Clone this repository to your computer.
2. Install the AEM CLI: `sudo npm install -g @adobe/aem-cli`
3. Start the AEM CLI: `aem up`
4. Open the project folder in your favorite code editor.
5. **Recommended:** Install npm packages: `npm i`

### Content Management

- Content is managed through [DA.live](https://da.live)
- Changes sync automatically via AEM Code Sync

## Features

### Localization & globalization

- Language only support - Ex: en, de, hi, ja
- Region only support - Ex: en-us, en-ca, de-de, de-ch
- Hybrid support - Ex: en, en-us, de, de-ch, de-at
- Fragment-based localized 404s
- Localized Header & Footer
- Do not translate support (#_dnt)

### Flexible section authoring

- Optional containers to constrain content
- Grids: 1-6
- Color scheme: light, dark
- Gap: xs, s, m, l, xl, xxl
- Spacing: xs, s, m, l, xl, xxl
- Background: token / image / color / gradient

### Base content

- Universal buttons w/ extensive styles
- Images w/ retina breakpoint
- Color scheme support: light, dark
- Modern favicon support
- New window support
- Deep link support
- Modal support

### Header and footer content

- Brand - First link in header
- Main Menu - First list in header
- Actions - Last section of header
- Menu & mega menu support
- Disable header/footer via meta props

### Scheduled content

- Schedule content using spreadsheets

### Sidekick

- Extensible plumbing for plugins
- Schedule simulator

### Performance

- Extensible LCP detection

### Developer tools

- Environment detection
- Extensible logging (console, coralogix, splunk, etc.)
- Buildless reactive framework support (Lit)
- Hash utils patterns (#_blank, #_dnt, etc)
- Modern CSS scoping & nesting
- AEM Operational Telemetry

### Operations

- Cloudflare Worker reference implementation

## Design System Dimensions

### Spacing

- **XXL**: 64px (previously 48px)
- **XL**: 48px (previously 32px)
- **L**: 32px (previously 24px)
- **M**: 16px (previously 12px)
- **S**: 8px
- **XS**: 4px

### Emphasis

quiet, default, strong

### Container columns

1 - 12

### Color tokens

100-900 (full spectrum for each color)

### Color Schemes

light, dark (with improved contrast ratios)

---

## Recent Updates (v2.0.0)

### Visual Design Refresh

- ✅ Modernized color palette with Tailwind-inspired colors
- ✅ Enhanced button styles with rounded corners and hover effects
- ✅ Updated card components with modern shadows and borders
- ✅ Improved hero section with gradient overlays
- ✅ Enhanced table styling with better readability
- ✅ Updated header with shadow and backdrop blur
- ✅ Improved footer contrast and styling
- ✅ Enhanced spacing scale for better visual hierarchy
- ✅ Added smooth transitions throughout the UI
- ✅ Better font rendering with antialiasing

### Documentation

- ✅ Updated README with personal site information
- ✅ Added comprehensive design refresh highlights
- ✅ Updated package.json with correct project details
