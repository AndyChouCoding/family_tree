import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl } from "@mui/material";

interface props {
    open:boolean;
    onClose:()=>void;
}

const AddRelationDialog:React.FC<props> = ({open, onClose}:props) => {
    return<>
        <Dialog open={open}>
            <DialogTitle></DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                <FormControl>新增關係</FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>{onClose()}}>取消</Button>
                <Button onClick={()=>{}}>新增</Button>
            </DialogActions>
        </Dialog>
    </>
}

export default AddRelationDialog;