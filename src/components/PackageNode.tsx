import { DependencyNode, StatusColor } from "../types";
import { useState } from "react";

export const NODE_SIZE = 35;

const NODE_LEFT_OFFSET = 30; 
const NODE_TOP_OFFSET = 30;

export function PackageNode({ node }: { node: DependencyNode }) {
    const [isHovering, setIsHovering] = useState(false);
    const formattedName = node.name.indexOf("-") > -1 ? node.name.split("-").join(" ") : node.name;
    const color = getColor(node.status);

    return (
        <div 
            className={`flex flex-col text-center p-2 rounded-full ${color} m-2 hover:scale(1.1) transition-transform cursor-pointer`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{width: isHovering ? `auto` : `${NODE_SIZE}px`,
                     height: isHovering ? `auto` : `${NODE_SIZE}px`, 
                     zIndex: isHovering ? 100 : 0,
                     position: isHovering ? `relative` : `absolute`,
                     left: isHovering ? `0px` : `${NODE_LEFT_OFFSET}px`,
                     top: isHovering ? `0px` : `${NODE_TOP_OFFSET}px` }}
            >
            {isHovering && (        
                <div>
                    <h1><strong>{formattedName}</strong></h1> 
                    <p>{node.version}v</p>
                </div>
            )}
        </div>
    )
}



const getColor = (status: string) => {
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