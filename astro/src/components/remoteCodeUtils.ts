export function selectTagged(content: string, tags: string): string {
  let lines = content.split('\n');
  const startLine = lines.findIndex((line) => line.includes(`tag::${tags}`));
  const endLine = lines.findIndex((line) => line.includes(`end::${tags}`));

  lines = lines.slice(startLine + 1, endLine);
  const prefixLengths = lines.filter((line) => line.trim().length > 0).map((line) => prefixSpaces(line));
  const shortestPrefix = Math.min(...prefixLengths);
  if (shortestPrefix > 0) {
    lines = lines.map((line) => line.substring(shortestPrefix));
  }

  return lines.join('\n').replace(/\s+$/g, '');
}

export function selectLines(content: string, lineNum: number, lineEnd: number): string {
  const lines = content.split('\n');
  if ((lineNum > 0) && (lineEnd > 0)) {
    return lines.slice(lineNum - 1, lineEnd - 1).join('\n');
  }

  if (lineNum > 0) {
    return lines[lineNum - 1];
  }

  return content;
}

export function prefixSpaces(str: string): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charAt(i) == ' ' || str.charAt(i) == '\t') {
      count++;
    } else {
      break;
    }
  }
  return count;
}
