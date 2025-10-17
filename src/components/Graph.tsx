import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  name: string;
  type: string;
  code_set?: string;
  code?: string;
  condition?: string;
  reference?: string;
  text?: string;
  x?: number;
  y?: number;
  color?: string;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  id: string;
  source: string | Node;
  target: string | Node;
  source_node: string;
  destination_node: string;
  edge_name: string;
  reference?: string;
  text?: string;
}

interface GraphProps {
  nodes: Node[];
  links: Link[];
  onNodeClick: (node: Node) => void;
  onLinkClick: (link: Link) => void;
  onAddEdge: (source: Node, target: Node) => void;
  addingEdge: boolean;
  selectedElement?: { type: "node" | "link"; data: Node | Link };
}

export interface GraphHandle {
  recenter: () => void;
}

const Graph = forwardRef<GraphHandle, GraphProps>((
  props,
  ref: React.ForwardedRef<GraphHandle>
) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<Node, Link> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // ✅ Recenter function
  useImperativeHandle(ref, () => ({
    recenter: () => {
      if (props.nodes.length === 0) return;

      if (simulationRef.current) simulationRef.current.stop();

      const xAvg = d3.mean(props.nodes, (d) => d.x) || 0;
      const yAvg = d3.mean(props.nodes, (d) => d.y) || 0;

      const svg = d3.select(svgRef.current);
      const width = svgRef.current?.clientWidth || 800;
      const height = svgRef.current?.clientHeight || 600;

      props.nodes.forEach((d) => {
        if (d.x !== undefined && d.y !== undefined) {
          d.x = width / 2 + (d.x - xAvg);
          d.y = height / 2 + (d.y - yAvg);
        }
      });

      svg
        .transition()
        .duration(750)
        .call(
          zoomRef.current!.transform as never,
          d3.zoomIdentity.translate(width / 2, height / 2).scale(1.0)
        );

      if (simulationRef.current) simulationRef.current.alpha(1).restart();
    },
  }));

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    d3.select(gRef.current).selectAll("*").remove();

    // ✅ Correct Zoom setup
    zoomRef.current = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        d3.select(gRef.current).attr("transform", event.transform);
      });

    // ✅ Attach zoom behavior to SVG
    d3.select(svgRef.current).call(zoomRef.current as never);

    if (props.nodes.length === 0) return;

    // ✅ Simulation setup
    simulationRef.current = d3
      .forceSimulation<Node>(props.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(props.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "radial",
        d3.forceRadial(Math.min(width, height) / 3, width / 2, height / 2)
      );

    // ✅ Links
    const link = d3
      .select(gRef.current)
      .append("g")
      .selectAll("line")
      .data(props.links)
      .join("line")
      .attr("class", "link")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .on("click", (event, d) => {
        event.stopPropagation();
        props.onLinkClick(d);
      });

    // ✅ Link labels
    const linkText = d3
      .select(gRef.current)
      .append("g")
      .selectAll("text")
      .data(props.links)
      .join("text")
      .attr("class", "link-text")
      .text((d) => d.edge_name || "")
      .attr("font-size", 11)
      .attr("fill", "#555")
      .style("pointer-events", "none");

    // ✅ Nodes (drag unchanged)
    const node = d3
      .select(gRef.current)
      .append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(props.nodes)
      .join("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on("start", (event, d) => {
            if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulationRef.current?.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        props.onNodeClick(d);
      });

    node
      .append("circle")
      .attr("r", 22)
      .attr("fill", (d) => d.color || "#ffeb3b")
      .attr("stroke", (d) =>
        props.selectedElement?.type === "node" &&
        props.selectedElement.data.id === d.id
          ? "#ff0000"
          : "#fff"
      )
      .attr("stroke-width", (d) =>
        props.selectedElement?.type === "node" &&
        props.selectedElement.data.id === d.id
          ? 3
          : 1.5
      );

    node
      .append("text")
      .text((d) => d.name || "")
      .attr("dy", 35)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .style("pointer-events", "none");

    // ✅ Arrow markers
    const defs = d3.select(gRef.current).append("defs");
    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#999");

    link.attr("marker-end", "url(#arrowhead)");

    // ✅ Update positions
    simulationRef.current.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      linkText
        .attr(
          "x",
          (d) => ((d.source as Node).x! + (d.target as Node).x!) / 2
        )
        .attr(
          "y",
          (d) => ((d.source as Node).y! + (d.target as Node).y!) / 2 - 5
        );

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // ✅ Cleanup
    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [props.nodes, props.links, props.selectedElement, props]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        margin: "10px",
        width:'100%',
        cursor: "default",
      }}
    >
      <g ref={gRef} />
    </svg>
  );
});

Graph.displayName = "Graph";

export default Graph;