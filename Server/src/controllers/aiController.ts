import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

type ExplainResult = {
  summary: string;
  complexity: "Basic" | "Intermediate";
  keyPoints: string[];
};

const buildExplanation = (code: string): ExplainResult => {
  const lines = code.split(/\r?\n/);
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  const functionMatches =
    code.match(/\bfunction\s+\w+\s*\(|\b\w+\s*=\s*\([^)]*\)\s*=>|\b\w+\s*:\s*\([^)]*\)\s*=>/g) || [];
  const hasAsync = /\basync\b|\bawait\b/.test(code);
  const hasApiCalls = /\bfetch\(|\baxios\.|\bhttp\./.test(code);
  const hasCondition = /\bif\b|\bswitch\b|\?\s*[^:]+\s*:/.test(code);

  const complexity: "Basic" | "Intermediate" =
    nonEmptyLines.length > 35 || functionMatches.length > 2 || hasAsync ? "Intermediate" : "Basic";

  const summary = `This code has ${functionMatches.length} function block(s) across ${nonEmptyLines.length} non-empty line(s) and follows a ${complexity.toLowerCase()} implementation style.`;

  const keyPoints: string[] = [];
  keyPoints.push(hasAsync ? "Uses async flow, so calls are non-blocking." : "Mostly synchronous-looking flow.");
  keyPoints.push(hasApiCalls ? "Contains API/network interaction." : "No direct API/network call detected.");
  keyPoints.push(hasCondition ? "Includes conditional decision logic." : "Flow is mostly linear with minimal branching.");

  return {
    summary,
    complexity,
    keyPoints,
  };
};

export const explainCode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body as { code?: string };

    if (!code || !code.trim()) {
      res.status(400).json({ message: "Code is required for explanation" });
      return;
    }

    if (code.length > 10000) {
      res.status(400).json({ message: "Code is too long. Please keep it under 10,000 characters." });
      return;
    }

    const explanation = buildExplanation(code);

    res.status(200).json({ message: "Code explanation generated", explanation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
