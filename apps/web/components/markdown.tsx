import type { ReactNode } from 'react';

/**
 * Deliberately tiny markdown renderer: headings (##), bullet lists, bold,
 * inline code and links. Everything is turned into React nodes — never HTML
 * strings — so user-authored content can't inject markup.
 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((https?:\/\/[^)\s]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];

    if (token.startsWith('**')) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${index}`}>{token.slice(2, -2)}</strong>,
      );
    } else if (token.startsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-c-${index}`}>{token.slice(1, -1)}</code>);
    } else {
      const label = token.slice(1, token.indexOf(']'));
      const href = match[2];
      nodes.push(
        <a key={`${keyPrefix}-a-${index}`} href={href} target="_blank" rel="noreferrer noopener">
          {label}
        </a>,
      );
    }

    lastIndex = match.index + token.length;
    index += 1;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const blocks = content.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className={className ?? 'prose-lc'}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter((line) => line.trim().length > 0);
        const key = `block-${blockIndex}`;

        if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
          return (
            <ul key={key}>
              {lines.map((line, lineIndex) => (
                <li key={`${key}-${lineIndex}`}>
                  {renderInline(line.replace(/^\s*[-*]\s+/, ''), `${key}-${lineIndex}`)}
                </li>
              ))}
            </ul>
          );
        }

        if (/^#{2,3}\s+/.test(lines[0])) {
          return (
            <h3 key={key}>{renderInline(lines[0].replace(/^#{2,3}\s+/, ''), key)}</h3>
          );
        }

        return <p key={key}>{renderInline(lines.join(' '), key)}</p>;
      })}
    </div>
  );
}
