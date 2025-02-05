import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { decode, sign, verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@uber-mensch/medium-commons";

export const blogRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string
    JWT_SECRET:   string
	},
    Variables: {
        userId: string
    }
}>();


blogRouter.use("/*", async(c, next) => {
    const tokenHeader = c.req.header("authorization") || ""
    const token = tokenHeader.startsWith("Bearer ") ? tokenHeader.split(" ")[1] : undefined;

if (!token) {
  return c.json({ message: "Unauthorized: No token provided" }, 401);
}
try{

    const user = await verify(token, c.env.JWT_SECRET)

    if(user){
        c.set("userId", user.id as  string);
        await next();

    }else{
        c.status(403);
        return c.json({
            mesage: " You're not logged in."
        })
    }
}catch(e){
    c.status(403);
        return c.json({
            mesage: " You're not logged in."
        })
}

   
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json();
      const authorId = c.get("userId")

      const success = createBlogInput.safeParse(body);
      if(!success){
        c.status(411);
        return c.json({
            message: " Invalid Inputs"
        })
      }
    const prisma = new PrismaClient({
          datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())
      

      const blog = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content,
            authorId
        }
      })
    return c.json({
        id: blog.id
    })
  })
  
  blogRouter.put('/', async (c) => {
    const body = await c.req.json();
    const authorId = c.get("userId")
    const success = updateBlogInput.safeParse(body);
      if(!success){
        c.status(411);
        return c.json({
            message: " Invalid Inputs"
        })
      }
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    

    const blog = await prisma.post.findUnique({
        where: { id: body.id},
      });
  
      if (!blog) {
        return c.json({ message: "Blog not found" }, 404);
      }

      if (blog.authorId !== authorId) {
        return c.json({ message: "Forbidden: You are not the author" }, 403);
      }
  

      const updatedBlog = await prisma.post.update({
        where: {
            id: body.id
        },
        data: {
            title: body.title,
            content: body.content,
            
        }
      })
    return c.json({
        id: blog.id
    })
    
  })
  
  blogRouter.get('/:id', async(c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const body = await c.req.json();
    try{
        const blog = await prisma.post.findFirst({
            where: {
                id: body.id
            },
            select: {
                title: true,
                content: true,
                author: {
                    select: {
                        name: true,
                    }
                }
            }
        })
        if(!blog){
            return c.json({message: "Blog has been removd or doesn't exist."}, 404)
        }
        return c.json({
            blog
        })
    }catch(e) {
        c.status(411);
        return c.json({
            message: "Error while fetching blog"
        })
    }
    
    
  })
  
  blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const page = Number(c.req.query('page')) || 1;
    const limit = Number(c.req.query('limit')) || 10;

    // Calculate how many items to skip
    const skip = (page - 1) * limit;

    // Fetch paginated blogs
    const blogs = await prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },  // Optional: Sort by newest first
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true,
                }
            }

        }  
         
    });

    // Get total count for pagination metadata
    const totalBlogs = await prisma.post.count();

    return c.json({
        blogs,
        page,
        totalPages: Math.ceil(totalBlogs / limit),
        totalBlogs
    });
    })
  
