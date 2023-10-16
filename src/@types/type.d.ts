interface Chat {
  threadId: string;
  title: string;
  type: string;
  createdAt: string;
}

interface Model {
  name: string;
  shortDescription: string;
  task: string;
}

interface Module {
  messageId: number;
  moduleName: string;
  models: Model[];
  summary: string;
}

interface Result {
  messageId: number;
  image: string | null
  text: string
}

interface querySummaryHistory {
  level: number;
  querySummary: string;
  messageId: number;
  date: string;
  parentMessageId: number | null;
}