import { useEffect, useState } from "react"
import type { Project } from "../types"
import { Loader2Icon } from "lucide-react"
import ProjectCard from "../components/ProjectCard"
import axios from "../configs/axios"
import toast from "react-hot-toast"

function Community() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/project/published')
      setProjects(data.projects || [])
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load community projects')
      console.error('Community projects error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return loading ? (
    <div className="flex justify-center items-center h-screen">
      <Loader2Icon className="w-8 h-8 animate-spin" />
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">

      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">Community</h1>
          <p className="text-gray-400">Discover and share projects with the community</p>
        </header>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} gen={project} setGenerations={setProjects} forCommunity={true}></ProjectCard>
          ))}
        </div>

        {projects.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No published projects found</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to share your amazing creations!</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default Community
