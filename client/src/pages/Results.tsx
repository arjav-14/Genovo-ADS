import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DownloadIcon, PlayIcon } from 'lucide-react';
import { PrimaryButton } from '../components/Buttons';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from '../configs/axios';
import toast from 'react-hot-toast';

const Results = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  if (!projectId) {
    navigate('/');
    return null;
  }

  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const fetchProjectData = async () => {
    try {
      const token = await getToken();
      console.log('Fetching project data for projectId:', projectId);
      const { data } = await axios.get(`/api/user/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched project data:', data);
      console.log('Generated Image:', data.project?.generatedImage);
      setProject(data.project);
      setIsGenerating(data.project.isGenerating);
      setIsLoading(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to load project data. Please try again.');
      console.error('Fetch error:', error?.response?.data || error);
    }
  };

  const handleGenerateVideo = async () => {
    if (!projectId) return;

    setIsGenerating(true);
    try {
      const token = await getToken();
      console.log('Calling video generation endpoint for projectId:', projectId);
      const { data } = await axios.post(
        `/api/project/video`,
        { projectId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Video generation response:', data);

      setProject((prev: any) =>
        prev
          ? { ...prev, generatedVideo: data.videoUrl, isGenerating: false }
          : prev
      );
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to generate video. Please try again.');
      console.error('Video generation error:', error?.response?.data || error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isLoaded && !user) {
      toast.error('You must be logged in to view this page');
      navigate('/');
      return;
    }
    if (user && !project?.id) {
      fetchProjectData();
    }
  }, [user, isLoaded, projectId, project?.id]);

  useEffect(() => {
    if (user && isGenerating && projectId) {
      const interval = setInterval(() => {
        fetchProjectData();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [user, isGenerating, projectId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-12">Generation Result</h1>
        
        {/* Debug info - remove after debugging */}
        <div className="mb-4 p-4 bg-gray-900 rounded text-sm text-gray-400">
          <p>Project ID: {projectId}</p>
          <p>Has Generated Image: {!!project?.generatedImage}</p>
          <p>Generated Image URL: {project?.generatedImage ? project.generatedImage.substring(0, 50) + '...' : 'null'}</p>
          <p>Has Generated Video: {!!project?.generatedVideo}</p>
          <p>Generated Video URL: {project?.generatedVideo ? project.generatedVideo.substring(0, 50) + '...' : 'null'}</p>
          <p>Is Generating: {project?.isGenerating}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden group">
              <div className={`relative ${project?.aspectRatio === '9:16' ? 'aspect-9/16' : 'aspect-video'} bg-gray-900 flex items-center justify-center`}>
                {project?.generatedImage && (
                  <img
                    src={project.generatedImage}
                    alt="Generated"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      project?.generatedVideo ? 'group-hover:opacity-0' : 'opacity-100'
                    }`}
                  />
                )}
                {project?.generatedVideo && (
                  <>
                    <video
                      src={project.generatedVideo}
                      controls
                      loop
                      playsInline
                      muted
                      preload="metadata"
                      className="absolute inset-0 w-full h-full object-cover"
                      poster={project.generatedImage}
                    />
                    {/* Mobile play button overlay */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden"
                    >
                      <div className="bg-black/50 rounded-full p-3 animate-pulse">
                        <PlayIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </>
                )}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="text-center">
                      <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-6"></div>
                      <p className="text-gray-300 text-lg">Generating your video...</p>
                    </div>
                  </div>
                )}
                {!project?.generatedImage && !isGenerating && (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-lg">No image generated yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <PrimaryButton 
                  className="w-full justify-center py-3"
                  onClick={() => handleDownload(project?.generatedImage, `${project?.productName || 'image'}.jpg`)}
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download Image
                </PrimaryButton>
                {project?.generatedVideo && (
                  <PrimaryButton 
                    className="w-full justify-center py-3"
                    onClick={() => handleDownload(project?.generatedVideo, `${project?.productName || 'video'}.mp4`)}
                  >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download Video
                  </PrimaryButton>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-linear-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-6"
            >
              <h3 className="text-xl font-semibold mb-3">Video Magic</h3>
              <p className="text-gray-300 text-sm mb-6">
                Turn this static image into a dynamic video for social media.
              </p>
              <PrimaryButton
                className="w-full justify-center py-3"
                onClick={handleGenerateVideo}
                disabled={isGenerating || !project?.generatedImage || !!project?.generatedVideo}
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </PrimaryButton>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;