import * as LucideIcons from "lucide-react";

export default function IconElement({ element }) {
  const { iconName = "Circle", size = 24, color = "#000" } = element;
  // Normalize icon name (Lucide icons are PascalCase)
  const formattedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  const Icon = LucideIcons[formattedName] || LucideIcons.HelpCircle;

  return (
    <div 
      style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        width: "100%",
        height: "100%"
      }}
    >
      <Icon size={size} color={color} />
    </div>
  );
}
