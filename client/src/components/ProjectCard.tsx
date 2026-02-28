import React, { useState, useRef, useEffect } from "react";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";
import {
  EllipsisIcon,
  ImageIcon,
  Loader2Icon,
  PlayIcon,
} from "lucide-react";
import axios from "../configs/axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

interface ProjectCardProps {
  gen: Project & { isGenerating?: boolean };
  setGenerations: React.Dispatch<React.SetStateAction<Project[]>>;
  forCommunity?: boolean;
}

function ProjectCard({
  gen,
  setGenerations,
  forCommunity = false,
}: ProjectCardProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Delete handler
  const handleDelete = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios.delete(`/api/project/${gen.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setGenerations((prev) =>
          prev.filter((p) => p.id !== gen.id)
        );
        toast.success("Project deleted successfully");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete project");
    }
  };

  // ✅ Publish handler
  const handlePublish = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.post(
        `/api/project/publish`,
        { projectId: gen.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setGenerations((prev) =>
        prev.map((p) =>
          p.id === gen.id ? { ...p, isPublished: true } : p
        )
      );

      toast.success(data.message || "Project published successfully");
    } catch (err: any) {
      console.error("Publish error:", err);
      toast.error(err?.response?.data?.message || "Failed to publish project");
    }
  };

  // ✅ Unpublish handler
  const handleUnpublish = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.post(
        `/api/project/unpublish`,
        { projectId: gen.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setGenerations((prev) =>
        prev.map((p) =>
          p.id === gen.id ? { ...p, isPublished: false } : p
        )
      );

      toast.success(data.message || "Project unpublished successfully");
    } catch (err: any) {
      console.error("Unpublish error:", err);
      toast.error(err?.response?.data?.message || "Failed to unpublish project");
    }
  };

  // ✅ View details handler
  const handleViewDetails = () => {
    navigate(`/results/${gen.id}`);
  };

  // ✅ Video generation handler
  const handleGenerateVideo = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      // Update local state to show generating
      setGenerations((prev) =>
        prev.map((p) =>
          p.id === gen.id ? { ...p, isGenerating: true } : p
        )
      );

      const { data } = await axios.post(
        `/api/project/video`,
        { projectId: gen.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the project with the generated video URL
      setGenerations((prev) =>
        prev.map((p) =>
          p.id === gen.id
            ? { ...p, generatedVideo: data.videoUrl, isGenerating: false }
            : p
        )
      );

      toast.success(data.message);
    } catch (err: any) {
      // Reset generating state on error
      setGenerations((prev) =>
        prev.map((p) =>
          p.id === gen.id ? { ...p, isGenerating: false } : p
        )
      );
      toast.error(
        err?.response?.data?.message || err?.message || "Failed to generate video"
      );
      console.error("Video generation error:", err);
    }
  };

  // ✅ Download handler
  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mb-4 break-inside-avoid">
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition group relative">

        {/* ================= Preview Section ================= */}
        <div
          className={`${
            gen?.aspectRatio === "9:16"
              ? "aspect-9/16"
              : "aspect-video"
          } relative overflow-hidden`}
        >
          {/* Image */}
          {gen.generatedImage && (
            <img
              src={gen.generatedImage}
              alt={gen.productName || "Generated Image"}
              className={`absolute inset-0 w-full h-full object-cover transition duration-500 ${
                gen.generatedVideo
                  ? "group-hover:opacity-0"
                  : "group-hover:scale-105"
              }`}
            />
          )}

          {/* Video */}
          {gen.generatedVideo && (
            <>
              <video
                src={gen.generatedVideo}
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition duration-500"
                onMouseEnter={(e) => {
                  const video = e.currentTarget;
                  video.play().catch(() => {
                    console.log("Autoplay prevented, user interaction required");
                  });
                }}
                onMouseLeave={(e) => e.currentTarget.pause()}
              />
              {/* Play button overlay for better UX */}
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                onClick={(e) => {
                  e.stopPropagation();
                  const video = e.currentTarget.parentElement?.querySelector('video');
                  if (video) {
                    if (video.paused) {
                      video.play();
                    } else {
                      video.pause();
                    }
                  }
                }}
              >
                <div className="bg-black/50 rounded-full p-3 pointer-events-auto cursor-pointer hover:bg-black/70 transition">
                  <PlayIcon className="w-6 h-6 text-white" />
                </div>
              </div>
            </>
          )}

          {/* Loader fallback */}
          {!gen.generatedImage && !gen.generatedVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/10 text-gray-400">
              <Loader2Icon className="size-7 animate-spin" />
            </div>
          )}

          {/* Status badges */}
          <div className="absolute left-3 top-3 flex gap-2 items-center">
            {gen.isGenerating && (
              <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                Generating
              </span>
            )}
            {gen.isPublished && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Published
              </span>
            )}
          </div>

          {/* Action Menu */}
          {!forCommunity && (
            <div
              className="absolute right-3 top-3"
              ref={menuRef}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu((prev) => !prev);
                }}
                className="bg-black/40 backdrop-blur p-1 rounded-full hover:bg-black/60"
              >
                <EllipsisIcon size={18} />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur border border-gray-600 rounded-lg shadow-lg text-sm overflow-hidden z-20">

                  {gen.generatedImage && (
                    <button
                      onClick={() => handleDownload(gen.generatedImage || '', `${gen.productName || 'image'}.jpg`)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 w-full text-left"
                    >
                      <ImageIcon size={14} />
                      Download Image
                    </button>
                  )}

                  {gen.generatedVideo && (
                    <button
                      onClick={() => handleDownload(gen.generatedVideo || '', `${gen.productName || 'video'}.mp4`)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 w-full text-left"
                    >
                      <ImageIcon size={14} />
                      Download Video
                    </button>
                  )}

                  <button
                    onClick={handleViewDetails}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300"
                  >
                    View Details
                  </button>

                  {!gen.isPublished && (
                    <button
                      onClick={handlePublish}
                      className="w-full text-left px-4 py-2 hover:bg-green-500/20 text-green-400"
                    >
                      Publish
                    </button>
                  )}

                  {gen.isPublished && (
                    <button
                      onClick={handleUnpublish}
                      className="w-full text-left px-4 py-2 hover:bg-orange-500/20 text-orange-400"
                    >
                      Unpublish
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Source images */}
          {gen.uploadedImages?.length > 0 && (
            <div className="absolute right-3 bottom-3 flex -space-x-2">
              {gen.uploadedImages.slice(0, 2).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="source"
                  className="w-8 h-8 rounded-full object-cover border border-white/20"
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= Details Section ================= */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">
                {gen.productName}
              </h3>

              {gen.createdAt && (
                <p className="text-xs text-gray-400">
                  Created:{" "}
                  {new Date(gen.createdAt).toLocaleString()}
                </p>
              )}
            </div>

            {gen.aspectRatio && (
              <span className="text-xs px-2 py-1 bg-white/5 rounded-full">
                Aspect: {gen.aspectRatio}
              </span>
            )}
          </div>

          {gen.productDescription && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">
                Description
              </p>
              <div className="text-sm text-gray-300 bg-white/5 p-2 rounded-md wrap-break-word">
                {gen.productDescription}
              </div>
            </div>
          )}

          {gen.UserPrompt && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">
                Prompt
              </p>
              <div className="text-sm text-gray-300 bg-white/5 p-2 rounded-md wrap-break-word">
                {gen.UserPrompt}
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() =>
                navigate("/create", { state: { ...gen } })
              }
              className="text-sm text-indigo-400 hover:underline"
            >
              Edit
            </button>
            {gen.generatedImage && !gen.generatedVideo && !gen.isGenerating && (
              <button
                onClick={handleGenerateVideo}
                className="text-sm text-green-400 hover:underline flex items-center gap-1"
              >
                <PlayIcon size={14} />
                Generate Video
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;