import { Injectable } from "@nestjs/common";
import { AgentType } from "@prisma/client";
import knowledgeBase from "./knowledge/knowledge-base.json";
import { KnowledgeDocument, RetrievedContextItem } from "./rag.types";

@Injectable()
export class RagService {
  private readonly documents = knowledgeBase as KnowledgeDocument[];

  retrieve(agentType: AgentType, input: string): RetrievedContextItem[] {
    const tokens = this.tokenize(input);
    const scopedDocuments = this.documents.filter((document) => document.agentType === agentType);

    const rankedDocuments = scopedDocuments
      .map((document) => ({
        id: document.id,
        title: document.title,
        content: document.content,
        score: this.score(document, tokens),
      }))
      .sort((left, right) => right.score - left.score);

    const matchingDocuments = rankedDocuments.filter((document) => document.score > 0);

    if (matchingDocuments.length > 0) {
      return matchingDocuments.slice(0, 3);
    }

    return [];
  }

  private tokenize(input: string): string[] {
    return input
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length > 2);
  }

  private score(document: KnowledgeDocument, tokens: string[]): number {
    return tokens.reduce((total, token) => {
      if (document.keywords.some((keyword) => keyword.includes(token) || token.includes(keyword))) {
        return total + 2;
      }

      const haystack = `${document.title} ${document.content}`.toLowerCase();
      return haystack.includes(token) ? total + 1 : total;
    }, 0);
  }
}
