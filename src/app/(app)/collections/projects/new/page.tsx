import { ProjectEditor } from "./components/project-editor";
  
export default function NewProjectPage() {
    return (
        <div className="flex flex-col gap-6">
             <h1 className="text-2xl font-semibold capitalize">Nuevo Proyecto</h1>
             <ProjectEditor />
        </div>
    )
}
