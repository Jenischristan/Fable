export async function downloadImage(url, filename = "image.jpg") {
  if (!url) return false;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    return true;
  } catch {
    window.open(url, "_blank", "noopener");
    return false;
  }
}

export async function shareContent({ title, text, url } = {}) {
  const shareUrl = url || window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return "copied";
  } catch {
    return "failed";
  }
}

export function shareMessageFor(result) {
  if (result === "copied") return "Link copied to clipboard.";
  if (result === "shared") return "Shared!";
  if (result === "failed") return "Couldn't share this.";
  return "";
}
