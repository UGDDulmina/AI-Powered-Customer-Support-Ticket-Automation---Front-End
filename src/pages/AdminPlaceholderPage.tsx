import { Construction } from "lucide-react";


interface AdminPlaceholderPageProps {
  title: string;
  description: string;
}


const AdminPlaceholderPage = ({
  title,
  description,
}: AdminPlaceholderPageProps) => {

  return (

    <div className="space-y-6">

      <div>

        <h1 className="text-2xl font-bold
                       text-slate-900">

          {title}

        </h1>

        <p className="mt-1 text-slate-500">

          {description}

        </p>

      </div>


      <div className="flex min-h-80 flex-col
                      items-center justify-center
                      rounded-xl border
                      border-slate-200 bg-white
                      p-8 text-center">

        <div className="mb-4 rounded-full
                        bg-blue-50 p-5
                        text-blue-600">

          <Construction size={36} />

        </div>

        <h2 className="text-xl font-semibold
                       text-slate-800">

          Coming Soon

        </h2>

        <p className="mt-2 max-w-md
                      text-slate-500">

          This module will be implemented
          in an upcoming development phase.

        </p>

      </div>

    </div>

  );

};


export default AdminPlaceholderPage;