import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await api.get("/settings/public")).data,
    staleTime: 300000,
    retry: 1,
  });
}

export function useProjects(params = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: async () => {
      const response = await api.get("/projects", { params });
      const data = response.data;

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data?.projects)) {
        return data.projects;
      }

      console.error("Unexpected /projects response:", data);
      return [];
    },
    staleTime: 60000,
    retry: 1,
  });
}

export function useProject(slug) {
  return useQuery({
    queryKey: ["project", slug],
    queryFn: async () => (await api.get(`/projects/${slug}`)).data,
    enabled: Boolean(slug),
    retry: 1,
  });
}

export function useBrochures() {
  return useQuery({
    queryKey: ["brochures"],
    queryFn: async () => (await api.get("/brochures")).data,
    staleTime: 60000,
    retry: 1,
  });
}
