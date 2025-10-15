export default function Card({ className = "" }) {
    return (
      <div
        className={`
            bg-gray-800
            outline-1 outline-zinc-700
            shadow-md hover:shadow-lg transition-all duration-300
            hover:scale-[1.03] cursor-pointer
            ${className}`}
      />
    );
  }
  