export default function PhoneFrame({ children, deviceType = "ios" }) {
  const isAndroid = deviceType === "android";

  return (
    <div className="phone-frame" style={{ 
      width: isAndroid ? "360px" : "375px", 
      height: isAndroid ? "740px" : "812px",
      borderRadius: isAndroid ? "32px" : "50px"
    }}>
      <div className="phone-frame__inner">
        {!isAndroid && <div className="phone-frame__notch" />}
        <div className="phone-frame__status-bar" />
        
        {children}
        
        {!isAndroid && <div className="phone-frame__home-indicator" />}
      </div>
    </div>
  );
}
