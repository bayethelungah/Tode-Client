import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { createRoot } from 'react-dom/client';
import { PackageNode } from './PackageNode';
import { DependencyNode } from '../types';
 

export const DependencyTreeGenerator = ({ dependencies, maxDepth }: { dependencies: DependencyNode, maxDepth: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !dependencies) return;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const width = 960;
    const height = 600;
    const margin = { top: 80, right: 20, bottom: 120, left: 20 };

    // Convert dependencies to hierarchical format
    const hierarchyData = d3.hierarchy(dependencies, d => 
      d.dependencies ? Object.values(d.dependencies) : null
    );

    // Create the tree layout
    const treeLayout = d3.cluster<DependencyNode>() // Using cluster instead of tree
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom]);

    // Apply the tree layout to our data
    const treeData = treeLayout(hierarchyData);

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

    // Create node groups
    const nodeGroups = svg.selectAll(".node")
      .data(treeData.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Add the actual nodes using React components
    nodeGroups.each(function(d: d3.HierarchyNode<DependencyNode>) {
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(<PackageNode node={d.data} />);
      
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