import Markdown from 'markdown-to-jsx';
import React, { useState } from 'react';

interface MarkdownifyProps {
  message: string | undefined;
  sanitizeLinks?: boolean;
}

const LinkPreview: React.FC<{
  href: string;
  children: React.ReactNode;
  sanitizeLinks: boolean;
}> = ({ href, children, sanitizeLinks }) => {
  const [hasError, setHasError] = useState(false);
  const basicAuthPattern = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\/[^@]+@/;

  if (basicAuthPattern.test(href)) {
    return null;
  }

  if (sanitizeLinks) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {href}
      </a>
    );
  }

  return hasError ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    <img
      src={href}
      alt={typeof children === 'string' ? children : 'Preview'}
      style={{ maxWidth: '100%', height: 'auto', borderRadius: '20px' }}
      onError={() => setHasError(true)}
    />
  );
};

const hasSpecialFormat = (m: string) => m.includes('\n\n') && m.indexOf('.') > 0 && m.indexOf(':') > m.indexOf('.');

const Markdownify: React.FC<MarkdownifyProps> = ({ message, sanitizeLinks = false }) => (
  <div className={'reset'}>
    <Markdown
      options={{
        enforceAtxHeadings: true,
        overrides: {
          a: {
            component: LinkPreview,
            props: {
              sanitizeLinks,
            },
          },
        },
        disableParsingRawHTML: true,
      }}
    >
      {message
        ?.replaceAll(/&#x([0-9A-Fa-f]+);/g, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
        ?.replaceAll(/(?<=\n)\d+\.\s/g, hasSpecialFormat(message) ? '\n\n$&' : '$&') ?? ''}
    </Markdown>
  </div>
);

export default Markdownify;
