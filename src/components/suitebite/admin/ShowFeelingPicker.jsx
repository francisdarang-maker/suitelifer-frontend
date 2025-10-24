import { X } from 'lucide-react'
import React from 'react'

function ShowFeelingPicker({setShowFeelingPicker, handleFeelingSelect}) {
      const feelings = [
    { id: 1, name: "happy", emoji: "😊", label: "Happy" },
    { id: 2, name: "sad", emoji: "😢", label: "Sad" },
    { id: 3, name: "excited", emoji: "🤩", label: "Excited" },
    { id: 4, name: "blessed", emoji: "🙏", label: "Blessed" },
    { id: 5, name: "loved", emoji: "🥰", label: "Loved" },
    { id: 6, name: "grateful", emoji: "😌", label: "Grateful" },
    { id: 7, name: "motivated", emoji: "💪", label: "Motivated" },
    { id: 8, name: "tired", emoji: "😴", label: "Tired" },
    { id: 9, name: "angry", emoji: "😠", label: "Angry" },
    { id: 10, name: "confused", emoji: "😕", label: "Confused" },
    { id: 11, name: "proud", emoji: "😎", label: "Proud" },
    { id: 12, name: "celebrating", emoji: "🎉", label: "Celebrating" },
  ];
  
  return (
   <>

             
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 bg-black/30 z-40"
                      onClick={() => setShowFeelingPicker(false)}
                    />

                    {/* Modal */}
                    <div
                      className="
                        fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        w-[90%] sm:w-[85%] md:w-[60%] lg:w-[40%] xl:w-[30%]
                        bg-white rounded-2xl shadow-2xl border border-gray-200
                        z-50 overflow-hidden
                        p-4
                      "
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">
                          How are you feeling?
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowFeelingPicker(false)}
                          className="p-1 hover:bg-gray-100 rounded-full transition-all"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      {/* Body */}
                      <div className="overflow-y-auto max-h-[65vh] pr-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {feelings.map((feeling) => (
                            <button
                              key={feeling.id}
                              type="button"
                              onClick={() => handleFeelingSelect(feeling)}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-all text-left border border-transparent hover:border-gray-300"
                            >
                              <span className="text-2xl">{feeling.emoji}</span>
                              <span className="text-sm font-medium text-gray-700">
                                {feeling.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

   </>
  )
}

export default ShowFeelingPicker
