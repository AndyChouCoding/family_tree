// src/components/GraphCanvas.tsx
import React, { useEffect, useRef } from "react";
import G6, { Edge, Graph, type IEdge } from "@antv/g6";
import type { FamilyData, FamilyEdge, FamilyNode } from "../utils/type";

export let updateGraphNodeIcon: (id: string, img: string) => void = () => {};

interface Props {
  data: FamilyData;
  addEdge: boolean;
  removeEdge: boolean;
  onNodeClick: (node: FamilyNode) => void;
  handleEdgeRemoved?: (edge: { source: string; target: string }) => void;
  handleEdgeAdded?: (edge: {source:string; target: string;}) => void;
}

const GraphCanvas: React.FC<Props> = ({
  data,
  addEdge,
  removeEdge,
  onNodeClick,
  handleEdgeRemoved,
  handleEdgeAdded
}) => {
  const container = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);

  // 1. 初始化：只跑一次 → 當 container 有東西、graphRef.current 還沒被設置時，才 new Graph
  useEffect(() => {
    if (!container.current || graphRef.current) return;

    // Register add edge
    G6.registerBehavior("click-add-edge", {
      getEvents() {
        return {
          "node:click": "onClick",
          mousemove:    "onMousemove",
        };
      },
      onClick(ev) {
        const self: any = this;
        const graph      = self.graph;
        const model      = ev.item.getModel();
        if (self.addingEdge && self.edge) {
          // 完成第二次点击：确定 target
          graph.updateItem(self.edge, { target: model.id });
          // ✨ MOD: 通知上层新增了这条edge
          if (handleEdgeAdded) {
            handleEdgeAdded({
              source: (self.edge.getModel() as any).source,
              target: model.id,
            });
          }
          self.edge      = null;
          self.addingEdge = false;
        } else {
          // 第一次点击：画一条“自环”edge
          self.edge      = graph.addItem("edge", {
            source: model.id,
            target: model.id,
          });
          self.addingEdge = true;
        }
      },
      onMousemove(ev) {
        const self: any = this;
        if (self.addingEdge && self.edge) {
          self.graph.updateItem(self.edge, {
            target: { x: ev.x, y: ev.y },
          });
        }
      },
    });

    // Register rm edge
    G6.registerBehavior("click-delete-edge", {
      getEvents() { return { "edge:click": "onClick" }; },
      onClick(this: any, ev) {
        const edge  = ev.item as IEdge;
        const model = edge.getModel();
        this.graph.removeItem(edge);
        if (handleEdgeRemoved) {
          handleEdgeRemoved({ source: model.source, target: model.target });
        }
      },
    });

    const graph = new G6.Graph({
      container: container.current!,
      width: container.current.scrollWidth,
      height: container.current.scrollHeight,
      layout: {
        type: "dagre",
        direction: "LR",
        getId: (d: FamilyNode) => d.id,
        // getHeight: () => 60,
        // getWidth: () => 100,
        // getVGap: () => 40,
        // getHGap: () => 80,
      },
      modes: {
        default: ["drag-canvas", "drag-node", "zoom-canvas", "click-select"],
        addEdge: ["click-add-edge", "click-select"],
        deleteEdge: ["click-delete-edge", "click-select"],
      },
      defaultNode: {
        type: "circle",
        size: [90, 90],
        icon: {
          show: true,
          width: 100,
          height: 100,
          position: "center",
          img: "",
          clip: {
            type: "circle",
            attrs: { x: 0, y: 0, r: 40 },
          },
        },
        labelCfg: {
          position: "bottom",
          style: { fontSize: 12, fill: "#000" },
        },
      },
      nodeStateStyles: {
        selected: {
          stroke: "#e2e2e2",
          lineWidth: 4,
          fill: "steelblue",
        },
      },
      defaultEdge: {
        type: "line",
        style: { stroke: "#aaa" },
      },
    });
    // 增加 == 選中node , 使用onNodeClick
    if (onNodeClick) {
      graph.on("node:click", (ev) => {
        if (!ev.item) return;
        const model = ev.item.getModel() as FamilyNode;
        onNodeClick(model);
      });
    }

    graph.on("afterlayout", () => {
      graph.fitView([40]);
      const curZoom = graph.getZoom();
      graph.zoomTo(curZoom * 1);
    });
    // 2. 第一次就帶入資料並 render
    const mapped = {
      nodes: data.nodes.map((n) => ({
        ...n,
        label: n.name,
        icon: {
          show: true,
          img: n.photo || "/default.png",
          width: 60,
          height: 60,
          position: "center",
          clip: {
            type: "circle",
            attrs: { x: 0, y: 0, r: 40 },
          },
        },
      })),
      edges: data.edges,
    };
    graph.data(mapped);
    graph.render();
    graphRef.current = graph;

    updateGraphNodeIcon = (id: string, img: string) => {
      if (!graphRef.current) return;
      const node = graphRef.current.findById(id);
      if (node) {
        graphRef.current.updateItem(node, {
          icon: { show: true, img, width: 90, height: 90, position: "center" },
        });
      }
    };

    // 3. 處理畫面 resize
    const handleResize = () => {
      if (container.current && graphRef.current) {
        graphRef.current.changeSize(
          container.current.scrollWidth,
          container.current.scrollHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [addEdge]); // [] 保證只跑一次

  // Edge Control
  // useEffect(() => {
  //   if (!graphRef.current) return;
  //   graphRef.current.setMode(addEdge ? "addEdge" : "default");
  // },[addEdge]);
  // useEffect(() => {
  //   if (!graphRef.current) return;
  //   graphRef.current.setMode(removeEdge ? "deleteEdge" : "default");
  // }, [removeEdge]);
  useEffect(() => {
  if (!graphRef.current) return;
  // 优先级：新增关系 > 删除关系 > 默认
  let mode: "addEdge" | "deleteEdge" | "default" = "default";
  if (addEdge) {
    mode = "addEdge";
  } else if (removeEdge) {
    mode = "deleteEdge";
  }
  graphRef.current.setMode(mode);
}, [addEdge, removeEdge]);
  //

  // 4. 當 data 真的改變（新增／刪除）時，再更新圖
  useEffect(() => {
    if (!graphRef.current) return;

    const mapped = {
      nodes: data.nodes.map((n) => ({
        ...n,
        label: n.name,
        icon: { img: n.photo || "default.png", width: 60, height: 60 },
      })),
      edges: data.edges,
    };
    graphRef.current.changeData(mapped);
    graphRef.current.fitView();
  }, [data]);

  return <div ref={container} style={{ width: "100%", height: "100%" }} />;
};

export default GraphCanvas;
