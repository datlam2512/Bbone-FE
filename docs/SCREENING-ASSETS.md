# Screening illustration assets

Generated with the built-in imagegen tool, saved in this project:

- `public/images/screening/body-check.png`: translucent blue full-body illustration, transparent background. Decorative only.
- `public/images/screening/joint-atlas.png`: six equal anatomical thumbnail cells, three columns by two rows. `JointIllustration.jsx` selects the correct cell through an SVG viewBox. The wrist fallback is a native vector schematic, not a mislabelled elbow image.

The artwork does not represent a patient's scan, a diagnosis, or a validated anatomical reference. Runtime image requests stay on this project's origin; images are not loaded from an external generation service.

## Final generation prompts

Body illustration:

> Create a single polished 3D medical wellness website illustration asset, tall full body adult human anatomical mannequin from rear three-quarter view, head to feet visible, arms slightly separated, translucent luminous healthcare blue glass body with subtle white skeleton/spine visible. Small warm peach orange glow highlights on shoulder, hip and knee, stylish softly shaded and refined like premium medical UI reference. Anatomical overview is decorative only, no disease depiction, no text, no labels, no border, no surrounding UI, isolated on truly transparent background. Portrait aspect ratio, central body occupies most height. Natural human proportions, two arms two legs, clean tasteful professional blue and white aesthetic.

Joint atlas:

> Create one single medical illustration atlas for a healthcare website, landscape 3:2 composition divided into EXACTLY 3 equal columns and 2 equal rows, six equal square cells with zero gutters. Each cell is a premium translucent luminous blue 3D anatomical closeup with white bones and one subtle warm orange joint glow, on identical very pale ice-blue background. Row 1 left shoulder and neck rear view; row1 center lumbar spine lower back rear; row1 right bent elbow joint side view. Row2 left knee joint side view; row2 center hip joint pelvis side; row2 right ankle and foot side view. Each closeup centered with room around it so cell crops work. Beautiful refined medical education style, anatomically plausible, decorative website thumbnail illustration. Absolutely no text, letters, labels, numbers, badges, lines dividing cells, no UI and no border. Match a professional modern blue and white bone and joint care website.
