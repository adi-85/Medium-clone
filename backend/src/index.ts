import { Hono } from 'hono'
import { cors } from "hono/cors"; 
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from "bcryptjs";
import { decode, sign, verify } from "hono/jwt";
import { userRouter } from './routes/user';
import { blogRouter } from './routes/blog';

const app = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET:   string
	}
}>();

// app.use(
// 	"*",
// 	cors({
// 	  origin: "https://medium-clone-psi-two.vercel.app", 
// 	  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// 	  allowHeaders: ["Content-Type", "Authorization"],
// 	  credentials: true, 
// 	})
//   );

app.use('*', async (ctx, next) => {
	// Handle preflight OPTIONS request
	if (ctx.req.method === 'OPTIONS') {
	  ctx.header('Access-Control-Allow-Origin', 'https://medium-clone-psi-two.vercel.app');
	  ctx.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	  ctx.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	  ctx.header('Access-Control-Allow-Credentials', 'true');
	  return new Response(null, { status: 204 }); // Return 204 with no content
	}
  
	// Add CORS headers for actual requests (POST, GET, etc.)
	ctx.header('Access-Control-Allow-Origin', 'https://medium-clone-psi-two.vercel.app');
	ctx.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	ctx.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	ctx.header('Access-Control-Allow-Credentials', 'true');
	
	// Proceed with the actual request
	return next();
  });
  



app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);





export default app
