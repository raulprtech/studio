import { PostEditor } from "./components/post-editor";
  
export default function NewPostPage() {
    return (
        <div className="flex flex-col gap-6">
             <h1 className="text-2xl font-semibold capitalize">Nuevo Post</h1>
             <PostEditor />
        </div>
    )
}
