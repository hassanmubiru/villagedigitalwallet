# Village Digital Wallet - Logo Assets

This directory contains all the official logo and branding assets for the Village Digital Wallet project.

## 📁 Available Assets

### 🎨 **Main Logos**
- **`logo.svg`** - Primary circular logo (200x200px)
  - Use for: Profile pictures, avatars, square spaces
  - Contains: Village houses, mobile phone, Celo symbol, blockchain connections

- **`logo-horizontal.svg`** - Horizontal banner logo (400x80px)
  - Use for: Headers, email signatures, business cards
  - Contains: Logo + text + tagline

- **`app-icon.svg`** - High-resolution app icon (512x512px)
  - Use for: App store submissions, PWA icons, large displays
  - Optimized for: Mobile app stores, high-DPI displays

- **`favicon.svg`** - Small favicon (32x32px)
  - Use for: Browser tabs, bookmarks, small icons
  - Simplified design for small sizes

### 🎯 **Logo Elements**

#### **Color Scheme**
- **Primary Blue**: `#3B82F6` (Main background)
- **Secondary Blue**: `#2563EB` (Gradients, borders)
- **Green**: `#10B981` (Mobile phone screen, connections)
- **Celo Yellow**: `#FCFF52` (Celo symbol)
- **Village Orange**: `#FED7AA` (House walls)
- **Red**: `#DC2626` (House roofs)

#### **Visual Elements**
1. **Village Houses**: Representing rural communities
2. **Mobile Phone/Wallet**: Digital finance interface
3. **Celo Symbol (₵)**: Blockchain integration
4. **Connection Lines**: Community network and blockchain
5. **Security Shield**: Trust and protection

## 💻 **Usage in Code**

### **React Component**
```tsx
import { Logo, LogoIcon, LogoWithText } from '@/components/Logo';

// Small icon for navigation
<LogoIcon className="w-8 h-8" />

// Medium logo for sections
<Logo size="medium" variant="main" />

// Horizontal logo with text
<Logo variant="horizontal" size="full" />

// Logo with custom text
<LogoWithText />
```

### **HTML/CSS**
```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="512x512" href="/app-icon.svg">

<!-- Logo in content -->
<img src="/logo.svg" alt="Village Digital Wallet" width="100" height="100">
```

### **Next.js Metadata**
```tsx
export const metadata: Metadata = {
  title: 'Village Digital Wallet',
  icons: {
    icon: '/favicon.svg',
    apple: '/app-icon.svg',
  },
}
```

## 🎨 **Brand Guidelines**

### **Do's ✅**
- Use the logo on clean, contrasting backgrounds
- Maintain proper spacing around the logo
- Use the horizontal version for wide spaces
- Keep the aspect ratio when resizing
- Use the favicon for small applications

### **Don'ts ❌**
- Don't stretch or distort the logo
- Don't use on busy or cluttered backgrounds
- Don't modify the colors without permission
- Don't remove or alter key elements
- Don't use low-resolution versions for print

### **Minimum Sizes**
- **Main Logo**: 48px minimum width
- **Horizontal Logo**: 200px minimum width
- **App Icon**: 32px minimum (favicon)
- **Print**: 1 inch minimum width

## 🌍 **Accessibility**

All logos include:
- **Alt text**: Descriptive alternative text
- **High contrast**: Visible on various backgrounds
- **Scalable**: Vector format (SVG) for all sizes
- **Color-blind friendly**: Distinguishable elements

## 📱 **Platform-Specific Usage**

### **Web/PWA**
- Favicon: `favicon.svg`
- Apple Touch Icon: `app-icon.svg`
- Manifest Icon: `app-icon.svg`

### **Social Media**
- Profile Picture: `logo.svg` (square crop)
- Cover Photo: `logo-horizontal.svg`
- Story/Post: `app-icon.svg`

### **Print Materials**
- Business Cards: `logo-horizontal.svg`
- Letterhead: `logo.svg`
- Merchandise: `app-icon.svg`

### **App Stores**
- iOS App Store: `app-icon.svg` (export as PNG)
- Google Play: `app-icon.svg` (export as PNG)
- PWA Manifest: `app-icon.svg`

## 🔄 **File Formats**

### **Current (SVG)**
- **Advantages**: Scalable, small file size, web-friendly
- **Use for**: Web, mobile apps, print (vector)

### **Need PNG/ICO?**
To create PNG or ICO versions:
1. Open the SVG in a graphics editor (GIMP, Photoshop, Inkscape)
2. Export as PNG at required sizes:
   - Favicon: 16x16, 32x32, 48x48, 64x64
   - App Icon: 57x57, 72x72, 114x114, 144x144, 512x512
   - Social: 400x400, 1200x630 (for social media)
3. Use online ICO converter for favicon.ico

## 📄 **License**

These logo assets are part of the Village Digital Wallet project and are subject to the same MIT license as the project code. You may use these assets in connection with the Village Digital Wallet project or derivative works.

## 🤝 **Contributing**

If you need additional logo variations or formats:
1. Open an issue describing your use case
2. Specify the required dimensions and format
3. Provide context for where it will be used

---

**Village Digital Wallet** - Bridging Traditional Finance with Blockchain Technology
