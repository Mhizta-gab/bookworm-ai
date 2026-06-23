import { NextRequest, NextResponse } from "next/server";
import { searchBookSegments } from "@/lib/actions/book.actions";

type ToolCallResult = {
  toolCallId?: string;
  result: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" ? (value as UnknownRecord) : {};
}

async function processBookSearch(bookId: unknown, query: unknown) {
  if (bookId == null || query == null || query === "") {
    return { result: "Missing bookId or query" };
  }

  const bookIdStr = String(bookId);
  const queryStr = String(query).trim();

  if (!bookIdStr || bookIdStr === "null" || bookIdStr === "undefined" || !queryStr) {
    return { result: "Missing bookId or query" };
  }

  const segments = await searchBookSegments(bookIdStr, queryStr, 3);

  if (!segments || !segments.length) {
    return { result: "No information found about this topic in the book." };
  }

  const combinedText = segments
    .map((segment) => (segment as { content: string }).content)
    .join("\n\n");

  return { result: combinedText };
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

function parseArgs(args: unknown): Record<string, unknown> {
  if (!args) return {};
  if (typeof args === "string") {
    try {
      return JSON.parse(args);
    } catch {
      return {};
    }
  }
  return args as Record<string, unknown>;
}

function getToolCalls(body: unknown) {
  const root = asRecord(body);
  const message = asRecord(root.message);

  return (
    message.toolCallList ??
    message.toolCalls ??
    root.toolCallList ??
    root.toolCalls ??
    []
  );
}

function getLegacyFunctionCall(body: unknown) {
  const root = asRecord(body);
  const message = asRecord(root.message);

  return message.functionCall ?? root.functionCall;
}

function getVariableBookId(body: unknown) {
  const root = asRecord(body);
  const message = asRecord(root.message);
  const call = asRecord(message.call ?? root.call);
  const artifact = asRecord(call.artifact);
  const messageArtifact = asRecord(message.artifact);
  const variableValues = asRecord(
    message.variableValues ??
      root.variableValues ??
      call.variableValues ??
      artifact.variableValues ??
      messageArtifact.variableValues
  );

  return variableValues.bookId;
}

function getCallArgs(toolCall: unknown) {
  const call = asRecord(toolCall);
  const func = asRecord(call.function);

  return parseArgs(
    func.arguments ??
      func.parameters ??
      call.arguments ??
      call.parameters
  );
}

function getCallName(toolCall: unknown) {
  const call = asRecord(toolCall);
  const func = asRecord(call.function);

  return func.name ?? call.name;
}

function isSearchBookTool(name: unknown) {
  return name === "searchBook" || name === "search_book";
}

export async function POST(request: NextRequest) {
  try {
    const urlBookId = request.nextUrl.searchParams.get("bookId");
    const body = await request.json();
    const variableBookId = getVariableBookId(body);

    const toolCallList = getToolCalls(body);

    if (Array.isArray(toolCallList) && toolCallList.length > 0) {
      const results: ToolCallResult[] = [];

      for (const toolCall of toolCallList) {
        const call = asRecord(toolCall);
        const args = getCallArgs(toolCall);
        const name = getCallName(toolCall);
        const toolCallId = call.id ?? call.toolCallId;

        if (isSearchBookTool(name)) {
          const searchResult = await processBookSearch(args.bookId ?? urlBookId ?? variableBookId, args.query);
          results.push({ toolCallId: typeof toolCallId === "string" ? toolCallId : undefined, ...searchResult });
        } else {
          results.push({
            toolCallId: typeof toolCallId === "string" ? toolCallId : undefined,
            result: `Unknown function: ${typeof name === "string" ? name : "unknown"}`,
          });
        }
      }

      return NextResponse.json({ results });
    }

    const functionCall = getLegacyFunctionCall(body);
    if (functionCall) {
      const call = asRecord(functionCall);
      const name = getCallName(functionCall);
      const parsed = getCallArgs(functionCall);
      const legacyId = typeof call.id === "string" ? call.id : "legacy-function-call";

      if (isSearchBookTool(name)) {
        const searchResult = await processBookSearch(parsed.bookId ?? urlBookId ?? variableBookId, parsed.query);
        return NextResponse.json({
          results: [{ toolCallId: legacyId, ...searchResult }],
        });
      }

      return NextResponse.json({
        results: [{ toolCallId: legacyId, result: `Unknown function: ${typeof name === "string" ? name : "unknown"}` }],
      });
    }

    const directBody = asRecord(body);
    if (directBody.query || urlBookId) {
      const searchResult = await processBookSearch(directBody.bookId ?? urlBookId ?? variableBookId, directBody.query);
      return NextResponse.json({ results: [{ toolCallId: "direct-search", ...searchResult }] });
    }

    return NextResponse.json({
      results: [{ result: "No tool calls found" }],
    });
  } catch (error) {
    console.error("Vapi search-book error:", error);
    return NextResponse.json({
      results: [{ result: "Error processing request" }],
    });
  }
}
