import { DependencyNode, StatusColor } from "../types";

export const NODE_SIZE = 35;

interface PackageNodeProps {
  node: DependencyNode;
  siblingCount: number;
  siblingIndex: number;
  onNodeClick: (node: DependencyNode) => void;
  isOverlapping?: boolean;
  overlapCount?: number;
}

export const PackageNode: React.FC<PackageNodeProps> = ({ 
  node, 
  siblingCount, 
  siblingIndex,
  onNodeClick,
  isOverlapping,
  overlapCount
}) => {
  const formattedName = node.name.indexOf("-") > -1 ? node.name.split("-").join(" ") : node.name;
  const color = getStatusColor(node.status);

  return (
    <div className={` 
      hover:bg-black
      hover:text-white  
      hover:scale-105
      hover:z-50
      transition-all duration-200
      relative p-2 rounded-full w-[90px] h-[90px] cursor-pointer
      flex flex-col items-center justify-center
      ${color}
      after:absolute after:bottom-0 after:right-1 after:text-xs after:opacity-70
    `} onClick={() => onNodeClick(node)}>
      <span className="text-sm font-semibold truncate w-full text-center">
        {formattedName}
      </span>
      <span className="text-xs opacity-70 truncate w-full text-center">
        {node.version}
      </span>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ok":
      return StatusColor.ok;
    case "outdated":
      return StatusColor.outdated;
    case "vulnerable":
      return StatusColor.vulnerable;
    default:
      return StatusColor.default;
  }
}