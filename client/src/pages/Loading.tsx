import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2Icon, SparklesIcon } from 'lucide-react';

function Loading() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const projectId = `proj-${Date.now()}`;
      navigate(`/results/${projectId}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-6 md:p-12 mt-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-linear-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold mb-4"
        >
          Creating Your AI Video
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 mb-8"
        >
          Our AI is analyzing your images and generating a stunning short video. This usually takes a few seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2">
            <Loader2Icon className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm text-gray-300">Processing images...</span>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "80%" }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="h-full bg-linear-to-r from-purple-600 to-indigo-600"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-3 gap-4 text-xs text-gray-500"
        >
          <div>
            <div className="font-medium text-gray-300">Upload</div>
            <div>Complete</div>
          </div>
          <div>
            <div className="font-medium text-gray-300">Generate</div>
            <div>In Progress</div>
          </div>
          <div>
            <div className="font-medium text-gray-300">Download</div>
            <div>Pending</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Loading;