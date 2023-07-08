// @ts-nocheck
import {useState, useEffect, useRef } from 'react';

const decreasePixels = 1;

const Textarea = ({ value, className, wrapperClassName, onChange, onFocus, limit, name, disabled }) => {
  const [focus, setFocus] = useState(false);
  const [content, setContent] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    setContent(value);
    setTimeout(() => {
      reHeight();
    }, 100);
  }, [value])

  const reHeight = () => {
    const area = ref.current;

    area.style.height = `${area.scrollHeight}px`;

    while (area.clientHeight >= area.scrollHeight) {
      area.style.height = `${area.clientHeight - decreasePixels}px`;
    }
  }

  const change = (e) => {
    if(limit) {
      setContent(e.target.value.slice(0, limit));
    }

    reHeight();

    if (onChange) {
      onChange({
        ...e,
        value: e.target.value.slice(0, limit)
      });
    }
  }

  const classNameW = `${wrapperClassName} ${focus ? 'focus' : ''}`;

  return (
    <div className={classNameW}>
      <textarea
        disabled={disabled}
        className={`textarea ${className} ${value.length === 0 ? 'highlight' : ''}`}
        value={content}
        ref={ref}
        rows={1}
        name={name}
        onChange={change}
      />
    </div>)
}

export default Textarea