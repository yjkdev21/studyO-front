import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/react-study-o/", // <YOUR_REPO_NAME> 부분에 해당하는 경로
});
