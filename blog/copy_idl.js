import { writeFileSync } from "fs";
import blog_idl from "./target/idl/blog_sol.json";

writeFileSync("./app/src/idl.json", JSON.stringify(blog_idl, null, 2));