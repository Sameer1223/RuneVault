export default function DailyGamePage() {
    return (
        <div className="flex flex-col items-center justify-center h-full gap-6">
            <h1 className="text-4xl font-bold text-white">Riftboundle</h1>
            <p className="text-lg text-gray-400 max-w-md text-center">
                Welcome to Riftboundle, guess the daily card based on the clues!
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg font-medium transition-colors">
                Start Today's Challenge
            </button>
        </div>
    )
  }