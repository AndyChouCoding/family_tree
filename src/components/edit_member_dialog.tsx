import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import type { FamilyNode } from "../utils/type";
import { useEffect, useMemo, useState } from "react";
import { updateGraphNodeIcon } from "./graph_canvas";

interface Props {
  open: boolean;
  onClose: () => void;
  onEdit: (updated: FamilyNode) => void;
  member?: FamilyNode;
  existingNode: FamilyNode[];
}

const EditMemberDialog: React.FC<Props> = ({
  open,
  onClose,
  onEdit,
  member,
  existingNode,
}) => {
  const [name, setName] = useState<string>(member?.name ?? "");
  const [gender, setGender] = useState<string>(member?.gender ?? "M");
  const [fatherId, setFatherId] = useState<string>(member?.father ?? "");
  const [motherId, setMotherId] = useState<string>(member?.mother ?? "");
  const [year, setYear] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [day, setDay] = useState<number | undefined>(undefined);
  const [age, setAge] = useState<number | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const maleNodes = useMemo(
    () => existingNode.filter((n) => n.gender === "M"),
    [existingNode]
  );

  const femaleNodes = useMemo(
    () => existingNode.filter((n) => n.gender === "F"),
    [existingNode]
  );

  useEffect(() => {
    if (member) {
      setName(member.name);
      setGender(member.gender);
      setFatherId(member.father ?? "");
      setMotherId(member.mother ?? "");
      setPhotoFile(null);
      setPhotoPreview(member.photo);
    }
  }, [member]);

  useEffect(() => {
    if (!member?.birth) {
      setYear(undefined);
      setMonth(undefined);
      setDay(undefined);
      return;
    }
    const [y, m, d] = member.birth.split("-");
    setYear(parseInt(y, 10));
    setMonth(parseInt(m, 10));
    setDay(parseInt(d, 10));
  }, [member?.birth]);

    useEffect(() => {
    // 只有当年／月／日都是数字时才计算
    if (
      typeof year === "number" &&
      typeof month === "number" &&
      typeof day === "number"
    ) {
      const today = new Date();
      // JS 中月份从 0 开始，所以要减 1
      const birth = new Date(year, month - 1, day);

      // 先算出年份差
      let calculatedAge = today.getFullYear() - birth.getFullYear();

      // 如果今天还没到出生月，或者在出生月但还没到出生日，就再减 1
      if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() < birth.getDate())
      ) {
        calculatedAge--;
      }

      setAge(calculatedAge);
    } else {
      setAge(undefined);
    }
  }, [year, month, day]);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview("");
    }
  };
  const handleSave = () => {
    if (!member) {
      return; // member 为空时直接退出
    }
    // 这里 TS 已经确定 member 是 FamilyNode，不会再是 undefined
    const updated: FamilyNode = {
      ...member,
      name: name.trim(),
      gender,
      father: fatherId || undefined,
      mother: motherId || undefined,
      photo: photoPreview,
    };
    onEdit(updated);
    updateGraphNodeIcon(updated.id, photoPreview);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>EditMemberDialog</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            autoFocus
            sx={{ mt: 1 }}
            label="姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="father-label">父 (可不選)</InputLabel>
            <Select
              labelId="father-label"
              id="father-select"
              value={fatherId}
              label="父 (可不選)"
              onChange={(e) => setFatherId(e.target.value)}
            >
              <MenuItem value="">
                <em>無</em>
              </MenuItem>
              {maleNodes.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="mother-label">母 (可不選)</InputLabel>
            <Select
              labelId="mother-label"
              id="mother-select"
              value={motherId}
              label="母 (可不選)"
              onChange={(e) => setMotherId(e.target.value)}
            >
              <MenuItem value="">
                <em>無</em>
              </MenuItem>
              {femaleNodes.map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              label="Gender"
              onChange={(e) => setGender(e.target.value)}
            >
              <MenuItem value={"M"}>Male</MenuItem>
              <MenuItem value={"F"}>Female</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="年"
                type="number"
                fullWidth
                value={year}
                onChange={(e) =>{
                    const v = e.target.value;
                    setYear(v === "" ? undefined :parseInt(v, 10)); 
                }}
              />
              <TextField
                label="月"
                type="number"
                fullWidth
                value={month}
                onChange={(e) =>{
                    const v = e.target.value;
                    setMonth(v === "" ? undefined :parseInt(v, 10)); 
                }}
              />
              <TextField
                label="日"
                type="number"
                fullWidth
                value={day}
                onChange={(e) =>{
                    const v = e.target.value;
                    setDay(v === "" ? undefined :parseInt(v, 10)); 
                }}
              />
            </Box>
          </FormControl>
          <FormControl>
            <TextField
              label={"年齡"}
              value={age}
              fullWidth
              disabled
              slotProps={{
                inputLabel: {
                  shrink: true, // 强制浮动
                },
              }}
            />
          </FormControl>
          <FormControl>
            {photoPreview && (
              <Box
                component="img"
                src={photoPreview}
                alt="預覽"
                sx={{ width: 200, height: 200, borderRadius: 1 }}
              />
            )}
            <Button variant="outlined" component="label">
              上傳照片
              <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
            </Button>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>取消</Button>
          <Button onClick={handleSave}>儲存</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default EditMemberDialog;
