import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  Toolbar,
  Typography,
} from "@mui/material";
import { useState } from "react";
import GraphCanvas from "./components/graph_canvas";
import type { FamilyData, FamilyEdge, FamilyNode } from "./utils/type";
import AddMemberDialog from "../src/components/add_member_dialog";
import RemoveMemberDialog from "../src/components/rm_member_dialog";
import EditMemberDialog from "./components/edit_member_dialog";


// src/App.tsx 里
const initialData: FamilyData = {
  nodes: [
    {
      id: "1",
      name: "野原爺爺",
      gender: "M",
      birth: "1952-08-20",   // ← 真正的出生日期
      photo: "/photo/shin_gp.png",
    },
    {
      id: "2",
      name: "野原奶奶",
      gender: "F",
      birth: "1957-03-15",
      photo: "/photo/shin_gm.png",
    },
    {
      id: "3",
      name: "野原廣志",
      gender: "M",
      father: "1",
      mother: "2",
      birth: "1992-10-01",
      photo: "/photo/shin_papa.png",
    },
    {
      id: "4",
      name: "野原美冴",
      gender: "F",
      father: "7",
      mother: "8",
      birth: "1996-05-12",
      photo: "/photo/shin_mama.png",
    },
    {
      id: "5",
      name: "野原新之助",
      gender: "M",
      father: "3",
      mother: "4",
      birth: "2019-12-15",
      photo: "/photo/shin.png",
    },
    {
      id: "6",
      name: "野原葵",
      gender: "F",
      father: "3",
      mother: "4",
      birth: "2023-02-20",
      photo: "/photo/shin_baby.png",
    },
    {
      id: "7",
      name: "小山爺爺",
      gender: "M",
      birth: "1953-11-03",
      photo: "/photo/shin_gp2.png",
    },
    {
      id: "8",
      name: "小山奶奶",
      gender: "F",
      birth: "1958-06-27",
      photo: "/photo/shin_gm2.png",
    },
  ],
  edges: [
    { source: "1", target: "3" },
    { source: "2", target: "3" },
    { source: "3", target: "5" },
    { source: "4", target: "5" },
    { source: "3", target: "6" },
    { source: "4", target: "6" },
    { source: "7", target: "4" },
    { source: "8", target: "4" },
  ],
};


const drawerWidth = 240;

function App() {
  const [data, setData] = useState<FamilyData>(initialData);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openRemove, setOpenRemove] = useState(false);
  const [openAddEdge, setOpenAddEdge] = useState(false);
  const [openRemoveEdge, setOpenRemoveEdge] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyNode>();
  const [deleteTargetId, setDeleteTargetId] = useState<string>("")

  const handleNodeClick = (node: FamilyNode) => {
    if (!node) {
      setSelectedMember(undefined);
      setDeleteTargetId("");
      return;
    }
    setSelectedMember(node);
    setDeleteTargetId(node.id);   
  };

  const handleEdgeRemoved = (removeEdge:{source:string, target:string}) => {
    setData(prev => {
      const NewEdge = prev.edges.filter(
        e => !(e.source === removeEdge.source && e.target === removeEdge.target )
      );
      const newNodes = prev.nodes.map(n=> {
        if(n.id === removeEdge.target) {
          return {...n,father:undefined};
        }
        if(n.id === removeEdge.source) {
          return {...n, mother:undefined};
        }
        return n;
      });
      return {nodes:newNodes, edges:NewEdge};
    })
  }

  const handleEdgeAdded = ({ source, target }: { source: string; target: string }) => {
    setData(prev => {
      // 1) 把新 edge 写入 edges
      const newEdges = [...prev.edges, { source, target }];
      // 2) 更新对应 target 节点的 father/mother 字段
      const newNodes = prev.nodes.map(n => {
        if (n.id === target) {
          // 按性别决定填 father 还是 mother
          return { 
            ...n,
            ...(prev.nodes.find(p => p.id === source)?.gender === "M"
               ? { father: source }
               : { mother: source })
          };
        }
        return n;
      });
      return { nodes: newNodes, edges: newEdges };
    });
  };

  const handleAdd = (
    node: FamilyNode,
    fatherId?: string,
    motherId?: string,
  ) => {
    setData((prev) => {
      const newNodes = [...prev.nodes, node];
      const newEdges = [
        ...prev.edges,
        ...(fatherId ? [{ source: fatherId, target: node.id }] : []),
        ...(motherId ? [{ source: motherId, target: node.id }] : []),
      ];
      return { nodes: newNodes, edges: newEdges };
    });
  };

  const handleRemove = (id: string) => {
    setData((prev) => ({
      nodes: prev.nodes.filter((n) => n.id !== id),
      edges: prev.edges.filter((e) => e.source !== id && e.target !== id),
    }));
    setDeleteTargetId("");
  };

  const handleEdit = (updated:FamilyNode) => {
    setData(prev=>{
      const newNodes = prev.nodes.map(n=> n.id === updated.id ? updated: n);
      const filtered = prev.edges.filter(e=> e.target !== updated.id);
      const added: FamilyEdge[] = [
        ...(updated.father ? [{source:updated.father, target:updated.id}]:[]),
        ...(updated.mother ? [{source:updated.mother, target:updated.id}]:[])
      ];
      return {
        nodes: newNodes,
        edges: [...filtered, ...added],
      };
    });
    setOpenEdit(false);
  }


  return (
    <>
      <Box sx={{ display: "flex", height: "100vh" }}>
        <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6">Family Tree</Typography>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              p: 2,
            },
          }}
        >
          <Box my={4}>
            <Divider />
          </Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setOpenAdd(true);
              setOpenAddEdge(false);
              setOpenRemoveEdge(false);
            }}
          >
            新增成員
          </Button>
          <Box my={1}>
            <Divider />
          </Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setOpenEdit(true);
              setOpenAddEdge(false);
              setOpenRemoveEdge(false);
            }}
          >
            編輯成員
          </Button>
          <Box my={1}>
            <Divider />
          </Box>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              setOpenRemove(true);
              setOpenAddEdge(false);
              setOpenRemoveEdge(false);
            }}
          >
            刪除成員
          </Button>
          <Box my={1}>
            <Divider />
          </Box>
          <Button
            variant={openAddEdge ? "contained" : "outlined"}
            color={openAddEdge ? "success" : "primary"}
            fullWidth
            onClick={() => {
              setOpenAddEdge((x) => {
                const next = !x;
                if (next) setOpenRemoveEdge(false);
                return next;
              });
            }}

          >
            新增關係
          </Button>
          <Box my={1}>
            <Divider />
          </Box>
          <Button
            variant={openRemoveEdge ? "contained" : "outlined"}
            color={openRemoveEdge ? "error" : "primary"}
            fullWidth
            onClick={() => {
              setOpenRemoveEdge((x) => {
                const next = !x;
                if (next) setOpenAddEdge(false);
                return next;
              });
            }} 
          >
            刪除關係
          </Button>
        </Drawer>

        <Box
          component="main"
          sx={{
            mt: "70px",
            width: "1000px",
            height: "500px",
            border: "1px solid",
          }}
        >
          <GraphCanvas
            data={data}
            addEdge={openAddEdge}
            removeEdge={openRemoveEdge}
            onNodeClick={handleNodeClick}
            handleEdgeRemoved={handleEdgeRemoved}
            handleEdgeAdded = {handleEdgeAdded}
          />
        </Box>

        <AddMemberDialog
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          existingNodes={data.nodes}
          onAdd={handleAdd}
        />
        <EditMemberDialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          onEdit={handleEdit}
          member={selectedMember}
          existingNode={data.nodes}
        />
        <RemoveMemberDialog
          open={openRemove}
          onClose={() => setOpenRemove(false)}
          existingNodes={data.nodes}
          onRemove={handleRemove}
          deleteTargetId={deleteTargetId}
        />
      </Box>
    </>
  );
}

export default App;
