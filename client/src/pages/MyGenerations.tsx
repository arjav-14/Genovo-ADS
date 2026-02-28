import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import type { Project } from "../types";
import ProjectCard from "../components/ProjectCard";
import { PrimaryButton } from "../components/Buttons";
import axios from "../configs/axios";



function MyGenerations() {
  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  // redirect to home if not logged in once loading completes
  useEffect(() => {
    if (isLoaded && !user) {
      navigate('/');
    }
  }, [isLoaded, user, navigate]);

  const fetchGenerations = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenerations(data.projects || []);
    } catch (err: any) {
      console.error('failed to fetch projects', err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchGenerations();
    }
  }, [isLoaded, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2Icon className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto">

        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            My Generations
          </h1>
          <p className="text-gray-400">
            Your generated projects will appear here
          </p>
        </header>

        {/* Empty State */}
        {generations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 mt-20">
            <p className="text-gray-400">
              No generations found. Start creating to see your projects here!
            </p>

            <PrimaryButton
              onClick={() => navigate("/create")}
              className="px-6 py-2"
            >
              Create New Generation
            </PrimaryButton>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {generations.map((gen) => (
              <ProjectCard
                key={gen.id}
                gen={gen}
                setGenerations={setGenerations}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyGenerations;
