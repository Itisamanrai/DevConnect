"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.explainCode = void 0;
const detectLanguage = (code, providedLanguage) => {
    if (providedLanguage && providedLanguage.trim())
        return providedLanguage.trim();
    if (/\b(function|const|let|var|=>|import|export)\b/.test(code))
        return "JavaScript/TypeScript";
    if (/\bdef\s+\w+\(|import\s+\w+/.test(code))
        return "Python";
    if (/\bpublic\s+class\b|\bSystem\.out\.println\b/.test(code))
        return "Java";
    return "General";
};
const buildExplanation = (code, language) => {
    const lines = code.split(/\r?\n/);
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const functionMatches = code.match(/\bfunction\s+\w+\s*\(|\b\w+\s*=\s*\([^)]*\)\s*=>|\b\w+\s*:\s*\([^)]*\)\s*=>/g) || [];
    const hasAsync = /\basync\b|\bawait\b/.test(code);
    const hasLoop = /\bfor\b|\bwhile\b|\.map\(|\.filter\(|\.reduce\(/.test(code);
    const hasCondition = /\bif\b|\bswitch\b|\?\s*[^:]+\s*:/.test(code);
    const hasApiCalls = /\bfetch\(|\baxios\.|\bhttp\./.test(code);
    const hasDbCalls = /\bfindById\b|\bfind\(|\bsave\(|\bupdate\b|\bpopulate\(/.test(code);
    const inferredLanguage = detectLanguage(code, language);
    const highlights = [];
    const suggestions = [];
    highlights.push(`Detected language: ${inferredLanguage}`);
    highlights.push(`This snippet has ${nonEmptyLines.length} non-empty lines and ${functionMatches.length} function-like blocks.`);
    if (hasAsync)
        highlights.push("Uses asynchronous flow (async/await), which is good for non-blocking operations.");
    if (hasLoop)
        highlights.push("Contains iteration logic (loops or array iteration methods).");
    if (hasCondition)
        highlights.push("Contains branching logic (if/switch/ternary).");
    if (hasApiCalls)
        highlights.push("Interacts with network/API calls.");
    if (hasDbCalls)
        highlights.push("Contains database-style operations.");
    suggestions.push("Keep functions focused on one clear responsibility for easier testing and maintenance.");
    if (hasAsync) {
        suggestions.push("Wrap async operations with clear error handling so failures return predictable messages.");
    }
    if (hasApiCalls || hasDbCalls) {
        suggestions.push("Validate inputs before external calls and sanitize outputs before returning them.");
    }
    if (!/try\s*{/.test(code) && (hasAsync || hasApiCalls || hasDbCalls)) {
        suggestions.push("Consider adding try/catch blocks around risky operations.");
    }
    const summary = [
        `This ${inferredLanguage} snippet appears to implement ${hasApiCalls ? "request/response" : "application"} logic`,
        hasDbCalls ? "with database interaction" : "without direct database interaction",
        hasCondition ? "and conditional decision paths." : "and mostly linear flow.",
    ].join(" ");
    return {
        summary,
        highlights,
        suggestions,
        metrics: {
            totalLines: lines.length,
            nonEmptyLines: nonEmptyLines.length,
            functionCount: functionMatches.length,
            asyncUsage: hasAsync,
        },
    };
};
const explainCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { code, language } = req.body;
        if (!code || !code.trim()) {
            res.status(400).json({ message: "Code is required for explanation" });
            return;
        }
        if (code.length > 10000) {
            res.status(400).json({ message: "Code is too long. Please keep it under 10,000 characters." });
            return;
        }
        const explanation = buildExplanation(code, language);
        res.status(200).json({ message: "Code explanation generated", explanation });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.explainCode = explainCode;
