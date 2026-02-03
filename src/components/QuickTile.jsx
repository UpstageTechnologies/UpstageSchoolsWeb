const QuickTile = ({ title, page, onOpen, color }) => {
    return (
      <div className="quick-tile" onClick={() => onOpen(page)}>
        <div className="tile-icon" style={{ background: color }}>
          {title.charAt(0).toUpperCase()}
        </div>
        <span>{title}</span>
      </div>
    );
  };
  
  export default QuickTile;
  