import * as LucideIcons from "lucide-react";

export default function PhoneFrame({ 
  children, 
  deviceType = "ios", 
  navigationConfig, 
  activePageId, 
  isDrawerOpen,
  onCloseDrawer,
  onNavigate 
}) {
  const isAndroid = deviceType === "android";
  const tabs = navigationConfig?.tabs || [];

  const renderIcon = (name, size = 20) => {
    const formattedName = (name || "Circle").charAt(0).toUpperCase() + (name || "Circle").slice(1);
    const Icon = LucideIcons[formattedName] || LucideIcons.Circle;
    return <Icon size={size} />;
  };

  return (
    <div className="phone-frame" style={{ 
      width: isAndroid ? "360px" : "375px", 
      height: isAndroid ? "740px" : "812px",
      borderRadius: isAndroid ? "32px" : "50px"
    }}>
      <div className="phone-frame__inner" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {!isAndroid && <div className="phone-frame__notch" />}
        <div className="phone-frame__status-bar" />
        
        <div className="phone-frame__viewport" style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {children}
          
          {/* Real Global Drawer - Moved INSIDE viewport to stay within phone bounds */}
          <div className={`phone-frame__drawer-overlay ${isDrawerOpen ? "is-open" : ""}`} onClick={onCloseDrawer}>
            <div className="phone-frame__drawer-content" onClick={e => e.stopPropagation()}>
              <div className="drawer-header">
                <div className="drawer-avatar" />
                <div className="drawer-name">User Profile</div>
              </div>
              <div className="drawer-menu">
                {tabs.map(tab => (
                  <button 
                    key={`drawer-${tab.id}`} 
                    className={`drawer-item ${activePageId === tab.targetPageId ? "is-active" : ""}`}
                    onClick={() => onNavigate && onNavigate(tab.targetPageId)}
                  >
                    <div className="drawer-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {renderIcon(tab.icon, 18)}
                    </div>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {navigationConfig?.enabled && (
          <div className="phone-frame__bottom-tabs">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                className={`phone-tab-item ${activePageId === tab.targetPageId ? "is-active" : ""}`}
                onClick={() => onNavigate && onNavigate(tab.targetPageId)}
              >
                <div className="phone-tab-icon-wrapper">
                  {renderIcon(tab.icon)}
                </div>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}
        
        {!isAndroid && <div className="phone-frame__home-indicator" />}
      </div>
    </div>
  );
}
