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
import { v4 as uuidv4 } from "uuid";

interface Props {
  open: boolean;
  onClose: () => void;
  existingNodes: FamilyNode[];
  onAdd: (node: FamilyNode, fatherId?: string, motherId?: string) => void;
}

const AddMemberDialog = ({ open, onClose, existingNodes, onAdd }: Props) => {
  const [name, setName] = useState<string>("");
  const [fatherId, setFatherId] = useState<string>("");
  const [motherId, setMotherId] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [age, setAge] = useState<number | "">();
  const [year, setYear] = useState<number | "">(1960);
  const [month, setMonth] = useState<number | "">(1);
  const [day, setDay] = useState<number | "">(1);
  //圖片上傳狀態
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const maleNodes = useMemo(
    () => existingNodes.filter((n) => n.gender === "M"),
    [existingNodes]
  );
  const femaleNode = useMemo(
    () => existingNodes.filter((n) => n.gender === "F"),
    [existingNodes]
  );

  useEffect(() => {
    if (open) {
      setName("");
      setFatherId("");
      setMotherId("");
      setGender("");
      setPhotoFile(null);
      setPhotoPreview("");
    }
  }, [open]);

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

  const handleConfirm = () => {
    const newNode: FamilyNode = {
      id: uuidv4(),
      name,
      gender,
      father: fatherId || undefined,
      mother: motherId || undefined,
      photo: photoPreview,
      year,
      age,
    };
    onAdd(newNode, fatherId, motherId || undefined);
    setName("");
    setFatherId("");
    setMotherId("");
    setGender("");
    onClose();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview("");
    }
  };
  
  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>add Member</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="姓名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          ></TextField>
          <FormControl fullWidth>
            <InputLabel>父 (可不選)</InputLabel>
            <Select
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
            <InputLabel>母 (可不選)</InputLabel>
            <Select
              value={motherId}
              label="父/母 (可不選)"
              onChange={(e) => setMotherId(e.target.value)}
            >
              <MenuItem value="">
                <em>無</em>
              </MenuItem>
              {femaleNode.map((n) => (
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
              <MenuItem value={"Male"}>Male</MenuItem>
              <MenuItem value={"Female"}>Female</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* 年 */}
              <TextField
                label="年"
                type="number"
                fullWidth
                value={year}
                onChange={(e) =>
                  setYear(e.target.value === "" ? "" : +e.target.value)
                }
              />
              {/* 月 */}
              <TextField
                label="月"
                type="number"
                fullWidth
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value === "" ? "" : +e.target.value)
                }
              />
              {/* 日 */}
              <TextField
                label="日"
                type="number"
                fullWidth
                value={day}
                onChange={(e) =>
                  setDay(e.target.value === "" ? "" : +e.target.value)
                }
              />
            </Box>
          </FormControl>
          <FormControl>
            <TextField
              label={"年齡"}
              value={age ?? ""}
              fullWidth
              disabled
              slotProps={{
                inputLabel: {
                  shrink: true, // 强制浮动
                },
              }}
            />
          </FormControl>

          <FormControl fullWidth>
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
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>cancel</Button>
          <Button disabled={!name} onClick={handleConfirm}>
            add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default AddMemberDialog;
