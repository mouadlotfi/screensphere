'use client';

import { useMemo, useState } from 'react';

const MAX_CHARACTERS = 200;

export default function ReadMore({ text }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { preview, needsTruncation } = useMemo(() => {
    if (!text || text.length <= MAX_CHARACTERS) {
      return { preview: text, needsTruncation: false };
    }
    return { preview: `${text.slice(0, MAX_CHARACTERS)}…`, needsTruncation: true };
  }, [text]);

  if (!text) {
    return <span className="text-white/60">No summary available.</span>;
  }

  if (!needsTruncation) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {isExpanded ? text : preview}{' '}
      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        className="font-semibold text-cyan-300 transition hover:text-cyan-100"
      >
        {isExpanded ? 'Show less' : 'Read more'}
      </button>
    </span>
  );
}
