import {
  Activity,
  AlertCircle,
  Apple,
  Bell,
  CheckCircle2,
  CheckSquare,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  FileCode,
  FolderOpen,
  Globe,
  HardDrive,
  Info,
  Layers,
  LayoutGrid,
  Maximize2,
  Moon,
  Monitor,
  RefreshCw,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Volume2,
  Zap,
} from "lucide";

export const icons = {
  Activity,
  AlertCircle,
  Apple,
  Bell,
  CheckCircle2,
  CheckSquare,
  Clock,
  Cpu,
  Database,
  ExternalLink,
  Eye,
  FileCode,
  FolderOpen,
  Globe,
  HardDrive,
  Info,
  Layers,
  LayoutGrid,
  Maximize2,
  Moon,
  Monitor,
  RefreshCw,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Volume2,
  Zap,
};

type IconNode = Array<[string, Record<string, string>]>;

export function renderIcon(
  name: keyof typeof icons,
  attrs: Record<string, string | number> = {}
): string {
  const icon = icons[name] as unknown as IconNode | undefined;
  if (!icon || !Array.isArray(icon)) {
    return `<svg width="${attrs.size || 18}" height="${attrs.size || 18}" viewBox="0 0 24 24"></svg>`;
  }

  const size = attrs.size || 18;
  const strokeWidth = attrs.strokeWidth || 2;
  const className = attrs.class || "";
  const color = attrs.color || "currentColor";

  const defaultSvgAttrs = {
    xmlns: "http://www.w3.org/2000/svg",
    width: String(size),
    height: String(size),
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: String(color),
    "stroke-width": String(strokeWidth),
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    class: `lucide-icon ${className}`.trim(),
  };

  const attrString = Object.entries(defaultSvgAttrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

  const childrenString = icon
    .map(([tag, elAttrs]) => {
      const elAttrString = Object.entries(elAttrs || {})
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${elAttrString}></${tag}>`;
    })
    .join("");

  return `<svg ${attrString}>${childrenString}</svg>`;
}
