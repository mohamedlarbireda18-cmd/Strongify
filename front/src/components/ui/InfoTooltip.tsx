import React, { useState, useEffect, useRef } from 'react';

interface InfoTooltipProps {
  title: string;
  content: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, content }) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!show) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  return (
    <span
      ref={ref}
      className="info-tooltip"
      onClick={(e) => {
        e.stopPropagation();
        setShow(!show);
      }}
    >
      ⓘ
      {show && (
        <div className="info-tooltip-popup">
          <strong>{title}</strong>
          <p>{content}</p>
        </div>
      )}
    </span>
  );
};