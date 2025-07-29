import { getResume } from "@/lib/data";
import ResumeClient from "./resume-client";

type Resume = {
  id: string;
  data: string;
  updatedAt: string;
};

export default async function ResumePage() {
  // 在服务端获取数据
  const resume = await getResume();

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            简历加载失败
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            简历数据不存在
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResumeClient resume={resume} />
  );
}
