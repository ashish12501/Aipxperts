import app from "./src/app.js";
import connectDB from "./src/db/db.js";

process.loadEnvFile?.();
const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
