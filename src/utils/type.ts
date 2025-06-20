import type { NodeConfig, EdgeConfig } from '@antv/g6/'

export interface FamilyNode extends NodeConfig {
    id:string,
    name:string,
    father?:string,
    mother?:string,
    gender:string,
    age?:number | "",
    year?:number | "",
    photo:string,
    birth?:string | "",
}

export interface FamilyEdge extends EdgeConfig {
  source: string        // 父或母
  target: string        // 小孩
  relation?: 'parent'   // 目前只需要 parent
}

export interface FamilyData {
    nodes:FamilyNode[]
    edges:FamilyEdge[]
}