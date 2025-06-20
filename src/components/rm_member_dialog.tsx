import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import type { FamilyNode } from "../utils/type";
import { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  existingNodes: FamilyNode[];
  onRemove: (id: string) => void;
  deleteTargetId: string;
}

const RemoveMemberDialog = ({
  open,
  onClose,
  existingNodes,
  onRemove,
  deleteTargetId,
}: Props) => {

  const [targetId, setTargetId] = useState<string>("");

  useEffect(()=>{
    if(open){
      setTargetId(deleteTargetId);
    }
  },[open,deleteTargetId])

  const handleConfirm = () => {
    onRemove(targetId);
    onClose();
    setTargetId("");
  };
  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle width={300} textAlign={"center"}>
          Delete Member
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>選擇要刪除的成員</InputLabel>
            <Select
              value={targetId}
              label="選擇成員"
              onChange={(e) => setTargetId(e.target.value)}
            >
              <MenuItem value="">
                <em>無</em>
              </MenuItem>
              {existingNodes.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button color="error" disabled={!targetId} onClick={handleConfirm}>
            刪除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default RemoveMemberDialog;
