interface Chat {
  threadId: string;
  title: string;
  type: string;
  createdAt: string;
}

interface Module {
  messageId: number;
  moduleName: string;
  models: { name: string; shortDescription: string; task: string }[];
  summary: string;
}
