import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import bcrypt from "bcryptjs";
import { decode, sign, verify } from "hono/jwt";
import { signupInput,signinInput } from "@uber-mensch/medium-commons";


export const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET:   string
	}
}>();
userRouter.post('/signup', async (c) => {
  const body = await c.req.json();
  const success = signupInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message: "Invalid Inputs"
    })
  }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())
  
  
  try{
  const hashedPwd = await bcrypt.hash(body.password, 10);
  
  const user = await prisma.user.create ({
    data: {
      email:  body.email,
      password: hashedPwd
    }
  })
  
  const token = await sign({ id: user.id},  c.env.JWT_SECRET)
  
   
    return c.json({ token })
  }catch(e){
    c.status(403);
    return c.json({ error: "error while signing up"})
  }
  })
  
  userRouter.post('/signin', async(c) => {

    const body = await c.req.json();

  const success = signinInput.safeParse(body);
  if(!success){
    c.status(411);
    return c.json({
      message: "Invalid Inputs"
    })
  }
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

  
  
  try{
  const { email, password } = await c.req.json();
  
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });
  
  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return c.json({ message: "Invalid password" }, 401);
      }
      const token = await sign( { id: user.id}, c.env.JWT_SECRET);
  
      return c.json({ message: "Sign-in successful", token });
    }catch(e){
      return c.json({ message: " Internal Sever Error"}, 500);
    }
  })