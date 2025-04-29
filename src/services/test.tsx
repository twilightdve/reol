interface INode {
  name: string;
  fixed?: boolean;
  x?: { _value: number };
  y?: { _value: number };
  value?: number;
  linkWith?: string[];
  children?: INode[];
}

function mergeINodes(node1: INode, node2: INode): INode {
  // 基本プロパティをマージ（存在するものを優先）
  const mergedINode: INode = {
    name: node1.name,
    fixed: node1.fixed ?? node2.fixed,
    x: node1.x ?? node2.x,
    y: node1.y ?? node2.y,
    value: node1.value ?? node2.value,
    linkWith: Array.from(
      new Set([...(node1.linkWith || []), ...(node2.linkWith || [])])
    ),
  };

  // 子要素がある場合、再帰的にマージ
  if (node1.children || node2.children) {
    const children1 = node1.children || [];
    const children2 = node2.children || [];
    mergedINode.children = mergeChildren([...children1, ...children2]);
  }

  return mergedINode;
}

function mergeChildren(nodes: INode[]): INode[] {
  const mergedMap = new Map<string, INode>();

  for (const node of nodes) {
    if (mergedMap.has(node.name)) {
      const existingINode = mergedMap.get(node.name)!;
      // 既存ノードと新しいノードをマージ
      mergedMap.set(node.name, mergeINodes(existingINode, node));
    } else {
      // 新規ノードをマップに追加
      mergedMap.set(node.name, { ...node });
    }
  }

  return Array.from(mergedMap.values());
}

// 使用例
const input: INode[] = [
  {
    name: "Reol",
    fixed: true,
    x: { _value: 50 },
    y: { _value: 50 },
    linkWith: ["Reol"],
    children: [
      {
        name: "2014",
        children: [
          {
            name: "Sweet Devil",
            value: 30,
            children: [
              {
                name: "Sweet Devil",
                linkWith: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

const output = mergeChildren(input);
console.log(JSON.stringify(output, null, 2));
