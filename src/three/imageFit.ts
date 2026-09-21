// "Contain" fit — an uploaded image isn't necessarily the same aspect
// ratio as the box it's displayed in, so this sizes it down within the
// box on whichever axis it doesn't need, preserving its real proportions
// rather than stretching it to fill a fixed-aspect plane.
export function containSize(imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number) {
  const imageAspect = imageWidth / imageHeight;
  const boxAspect = boxWidth / boxHeight;
  return imageAspect > boxAspect
    ? { width: boxWidth, height: boxWidth / imageAspect }
    : { width: boxHeight * imageAspect, height: boxHeight };
}
