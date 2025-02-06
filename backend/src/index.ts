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

app.use('/*', cors({
	origin: 'https://medium-clone-psi-two.vercel.app',
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	credentials: true, 
  }
));



app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);





export default app
