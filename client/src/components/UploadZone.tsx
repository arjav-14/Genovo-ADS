import { UploadIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import type { UploadZoneProps } from "../types"

const UploadZone = ({ label, file, onClear, onChange }: UploadZoneProps) => {

  const [preview, setPreview] = useState<string | null>(null)

  // Create preview URL safely
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)

    return () => URL.revokeObjectURL(url)
  }, [file])

  return (
    <div>
      <label
        className={`relative h-64 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center
        justify-center bg-white/2 p-6 cursor-pointer
        ${file ? "border-green-500" : "border-gray-300"}`}
      >

        {/* Hidden Input */}
        <input
          type="file"
          hidden
          onChange={onChange}
        />

        {file && preview ? (
          <>
            {/* Preview Image */}
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-60"
            />

            {/* Clear Button */}
            <button
              type="button"
              onClick={onClear}
              className="absolute top-3 right-3 bg-white rounded-full p-1"
            >
              <XIcon className="w-5 h-5 text-red-500" />
            </button>

            {/* File Name */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/10">
              <p className="text-sm font-medium truncate text-white">
                {file.name}
              </p>
            </div>
          </>
        ) : (
          <>
          <div className="flex flex-col items-center justify-center">
            <UploadIcon className="w-12 h-12 text-gray-400" />
            <p className="text-gray-400 text-sm mt-2">
              Click to upload {label}
            </p>
            <input type="file" accept="image/*" onChange={onChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>
          </>
        )}

      </label>
    </div>
  )
}

export default UploadZone
