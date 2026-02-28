import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";
import UploadZone from "../components/UploadZone";
import { Loader2Icon, RectangleHorizontalIcon, RectangleVerticalIcon, Wand2Icon } from "lucide-react";
import { PrimaryButton } from "../components/Buttons";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import axios from "../configs/axios";

const Generator = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("9:16");
  const [productImage, setProductImage] = useState<File | null>(null);
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const {user} = useUser();
  const {getToken} = useAuth();
  
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "product" | "model"
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "product") {
        setProductImage(e.target.files[0]);
      } else {
        setModelImage(e.target.files[0]);
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(!user) return toast('You must be logged in to generate a video');
    if(!productImage || !modelImage || !productName || !name || !aspectRatio) return toast('Please upload both product and model images, productName, and select an aspect ratio', );
    try{
      setIsGenerating(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("productName", productName);
      formData.append("productDescription", productDescription);
      formData.append("aspectRatio", aspectRatio);
      formData.append("productImage", productImage!);
      formData.append("modelImage", modelImage!);
      formData.append("userPrompt", userPrompt);
      const token = await getToken();
      const {data} = await axios.post('/api/project/create' , formData , {
        headers : {
          
          'Authorization' : `Bearer ${token}`}
      })
          
      toast.success(data.message);
      // path name must match App route (/results/:projectId)
      navigate(`/results/${data.projectId}`);
    }catch(error : any){
          setIsGenerating(false);
          toast.error(error?.message || 'An error occurred while generating the video. Please try again.') 
    }
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12 mt-28">
      <form onSubmit={handleGenerate} className="max-w-4xl mx-auto mb-40">
        <Title
          heading="Create AI Short Video"
          description="Upload your model and product images to generate stunning UGC, short-form videos and social media posts"
        />

        <div className="flex gap-20 max-sm:flex-col items-start justify-between">
          <div className="flex flex-col w-full sm:max-w-60 gap-8 mt-8 mb-12">
            <UploadZone
              label="Product Image"
              file={productImage}
              onClear={() => setProductImage(null)}
              onChange={(e) => handleFileChange(e, "product")}
            />

            <UploadZone
              label="Model Image"
              file={modelImage}
              onClear={() => setModelImage(null)}
              onChange={(e) => handleFileChange(e, "model")}
            />
          </div>

          <div className="w-full">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">Project Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mt-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Name your project"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="productName" className="block text-sm font-medium mb-2 text-gray-400">Product Name</label>
              <input
                type="text"
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full p-3 mt-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Name your product"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="productDescription" className="block text-sm font-medium mb-2 text-gray-400">
                Product Description <span className="text-xs text-violet-400">(Optional)</span>
              </label>
              <textarea
                id="productDescription"
                name="productDescription"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="w-full p-3 mt-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Describe your product"
                rows={4}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-4 text-gray-400">Aspect Ratio</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${
                    aspectRatio === '9:16' ? 'ring-violet-500/50 bg-white/10' : ''
                  }`}
                  onClick={() => setAspectRatio('9:16')}
                >
                  <RectangleVerticalIcon className="w-full h-full" />
                </button>
                <button
                  type="button"
                  className={`p-2.5 size-13 bg-white/6 rounded transition-all ring-2 ring-transparent cursor-pointer ${
                    aspectRatio === '16:9' ? 'ring-violet-500/50 bg-white/10' : ''
                  }`}
                  onClick={() => setAspectRatio('16:9')}
                >
                  <RectangleHorizontalIcon className="w-full h-full" />
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="userPrompt" className="block text-sm font-medium mb-2 text-gray-400">
                Custom Prompt <span className="text-xs text-violet-400">(Optional)</span>
              </label>
              <textarea
                id="userPrompt"
                name="userPrompt"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="w-full p-3 mt-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add custom instructions for the AI..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <PrimaryButton 
            type="submit"
            disabled={isGenerating} 
            className="px-10 py-3 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Wand2Icon className="mr-2" />
                Generate Video
              </>
            )}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};

export default Generator;
