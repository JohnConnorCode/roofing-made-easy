#!/usr/bin/env node
/**
 * Generate required image assets for SEO
 *
 * Run with: node scripts/generate-assets.js
 *
 * This script generates:
 * - /public/images/og-default.jpg (1200x630 social sharing image)
 * - /public/apple-touch-icon.png (180x180 iOS icon)
 */

const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')

// OG Image SVG template (1200x630)
const ogImageSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- Background -->
  <rect width="1200" height="630" fill="#0c0f14"/>

  <!-- Subtle pattern overlay -->
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1f29" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)"/>

  <!-- Gold accent bar at top -->
  <rect width="1200" height="6" fill="#c9a25c"/>

  <!-- House/Roof Icon (centered) -->
  <g transform="translate(500, 140) scale(0.8)">
    <path d="M256 80L60 220v212h152V312h88v120h152V220L256 80z" fill="#c9a25c"/>
    <path d="M256 80L60 220h392L256 80z" fill="#a8863d"/>
  </g>

  <!-- Company Name -->
  <text x="600" y="450" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="bold" fill="#ffffff">Farrell Roofing</text>

  <!-- Tagline -->
  <text x="600" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#c9a25c">Northeast Mississippi's Trusted Roofing Experts</text>

  <!-- Location -->
  <text x="600" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" fill="#888888">Tupelo, MS | Serving Lee County &amp; Surrounding Areas</text>

  <!-- Gold accent bar at bottom -->
  <rect y="624" width="1200" height="6" fill="#c9a25c"/>
</svg>`

// Apple Touch Icon SVG template (180x180)
const appleTouchIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <rect width="180" height="180" rx="36" fill="#0c0f14"/>
  <g transform="translate(25, 25) scale(0.254)">
    <path d="M256 80L60 220v212h152V312h88v120h152V220L256 80z" fill="#c9a25c"/>
    <path d="M256 80L60 220h392L256 80z" fill="#a8863d"/>
  </g>
</svg>`

async function generateAssets() {
  console.log('Generating image assets...\n')

  // Ensure directories exist
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true })
  }

  try {
    // Generate OG image (JPG)
    console.log('Creating /public/images/og-default.jpg (1200x630)...')
    await sharp(Buffer.from(ogImageSvg))
      .jpeg({ quality: 90 })
      .toFile(path.join(IMAGES_DIR, 'og-default.jpg'))
    console.log('  ✓ og-default.jpg created successfully\n')

    // Generate Apple Touch Icon (PNG)
    console.log('Creating /public/apple-touch-icon.png (180x180)...')
    await sharp(Buffer.from(appleTouchIconSvg))
      .png()
      .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'))
    console.log('  ✓ apple-touch-icon.png created successfully\n')

    console.log('All assets generated successfully!')
    console.log('\nNote: Replace these placeholder images with real branded assets before launch.')

  } catch (error) {
    console.error('Error generating assets:', error)
    process.exit(1)
  }
}

generateAssets()
