# Piston, the fleet mascot

An original capybara mechanic for Fleet Tracker. Generated with the built-in image generation tool, then resized and encoded as a 256px WebP for the app, preserving transparency. The served asset is `piston.webp`.

The favicon reuses this same illustration and transparency in `app/favicon.ico`, with 16, 32, and 48px versions. Next.js includes it automatically on every page. Regenerate it with `node scripts/generate-favicon.mjs` from the frontend directory; the script uses Sharp already installed with Next.js and does not call an image generation service.

Use `FleetMascot` for the decorative illustration, `MascotButton` for the primary Add interaction, and `MascotDialogTitle` for create/edit and record-detail dialog titles. Keep record logic and form state in their existing page hooks. Do not add the playful treatment to destructive actions or errors.

The button reveal runs only on fine-pointer hover or keyboard focus, never loops, never intercepts clicks, and disables transitions for reduced motion. The header and dialog mascot stay still.

## Generation prompt

Use case: stylized-concept. Asset type: a transparent mascot illustration for a small fleet and vehicle-maintenance management app, reused in a 48px header, a hover peek from behind a blue Add button, and a small form-dialog header. Subject: one original friendly capybara mechanic, frontal upper-body portrait, warm tawny fur, recognizable broad capybara muzzle and two small rounded ears, calm friendly dark eyes and a small smile, wearing a simple work cap and overalls in the app's cobalt/navy blue #2459a6. Both little paws visible along the bottom as if resting gently on an invisible ledge. Style: refined playful editorial character illustration, clean bold simplified shapes and a very restrained soft shading, warm and approachable but not babyish, readable at small UI size. Composition: centered single character filling most of a square frame with a small safety margin; large face, cap and both ears fully visible, upper body ending cleanly, no cut-off hands; silhouette suitable for peeking over a button. Background: genuinely transparent alpha, no scenery, no ground, no cast shadow outside the character. Constraints: no text, no lettering, no logo, no watermark, no surrounding objects, no frame, no extra characters. Palette must harmonize with light neutral surfaces, blue #2459a6 and dark navy #172b45.
