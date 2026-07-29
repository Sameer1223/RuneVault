import { useState, useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";

interface EditableDeckTitleProps {
  initialTitle?: string;
  onTitleChange: (newTitle: string) => void;
}

export default function EditableDeckTitle({
  initialTitle = "Untitled Deck",
  onTitleChange,
}: EditableDeckTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  // Auto-select the whole title on entering edit mode so the user can just
  // start typing to replace it, without needing to double-click first.
  useEffect(() => {
    if (isEditing) inputRef.current?.select();
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onTitleChange(title.trim() || "Untitled Deck");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onTitleChange(title.trim() || "Untitled Deck");
    }
  };

  return (
    <div className="py-1 w-full">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="text-xl sm:text-2xl lg:text-3xl font-semibold bg-transparent border-b border-gray-500
                     focus:outline-none focus:border-[#caa368] caret-[#caa368]
                     w-full transition-colors"
        />
      ) : (
        <div
          className="text-xl sm:text-2xl lg:text-3xl font-semibold cursor-text hover:text-gray-400 transition-colors truncate"
          onClick={handleClick}
          title="Click to rename"
        >
          {title}
        </div>
      )}
    </div>
  );
}
