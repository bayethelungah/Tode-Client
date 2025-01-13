import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createRoot } from 'react-dom/client';
import { PackageNode } from './PackageNode';
import { DependencyNode } from '../types';
import { NODE_SIZE } from './PackageNode';

export const DependencyTreeGenerator = ({ dependencies, maxDepth, onNodeClick }: { dependencies: DependencyNode, maxDepth: number, onNodeClick: (node: DependencyNode) => void }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !dependencies) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 1200;
    const height = 600;
    const margin = { top: 80, right: 20, bottom: 120, left: 20 };

    // Convert dependencies to hierarchical format
    const hierarchyData = d3.hierarchy(dependencies, d => 
      d.dependencies ? Object.values(d.dependencies) : null
    );

    // Add sibling count to each node
    hierarchyData.each(node => {
      // Count siblings (including self)
      const siblingCount = node.parent 
        ? node.parent.children?.length || 1 
        : 1;
      
      // Add custom properties to the node's data
      (node as any).siblingCount = siblingCount;
      (node as any).siblingIndex = node.parent 
        ? node.parent.children?.indexOf(node) || 0 
        : 0;
    });

    // Add this function to check for overlaps
    const checkOverlap = (nodes: d3.HierarchyPointNode<DependencyNode>[]) => {
      const nodeSize = NODE_SIZE; // match the size from PackageNode
      const overlaps: { [key: string]: number } = {};
      
      nodes.forEach((node, i) => {
        nodes.forEach((otherNode, j) => {
          if (i !== j) {
            const dx = node.x - otherNode.x;
            const dy = node.y - otherNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nodeSize) {
              overlaps[node.data.name] = (overlaps[node.data.name] || 0) + 1;
              overlaps[otherNode.data.name] = (overlaps[otherNode.data.name] || 0) + 1;
            }
          }
        });
      });
      
      return overlaps;
    };

    // Create the tree layout with more spacing
    const treeLayout = d3.cluster<DependencyNode>()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .separation((a, b) => {
        return (a.parent === b.parent ? 2 : 3); // Increase spacing between nodes
      });

    // Apply the tree layout to our data
    const treeData = treeLayout(hierarchyData);
    
    // Check for overlaps
    const overlaps = checkOverlap(treeData.descendants());

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add links between nodes
    svg.selectAll(".link")
      .data(treeData.links())
      .join("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.5)
      .attr("d", (d: any) => {
        return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
      });

    // Create node groups with overlap information
    const nodeGroups = svg.selectAll(".node")
      .data(treeData.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add the actual nodes using React components with overlap info
    nodeGroups.each(function(d: d3.HierarchyNode<DependencyNode>) {
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(
        <PackageNode 
          onNodeClick={onNodeClick}
          node={d.data} 
          siblingCount={(d as any).siblingCount}
          siblingIndex={(d as any).siblingIndex}
          isOverlapping={overlaps[d.data.name] > 0}
          overlapCount={overlaps[d.data.name] || 0}
        />
      );
      
      const foreignObject = d3.select(this)
        .append("foreignObject")
        .attr("width", 120)
        .attr("height", 120)
        .attr("x", -60)
        .attr("y", -60)
        .node();

      if (foreignObject) {
        foreignObject.appendChild(container);
      }
    });

  }, [dependencies, maxDepth]);

  return (
    <div className="dependency-tree-container">
      <svg ref={svgRef}></svg>
    </div>
  );
};