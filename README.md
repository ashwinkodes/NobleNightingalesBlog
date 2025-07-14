# Final project - A personal blogging system - Team Noble Nightingales

Team Members:
- Xiaoyu Cai
- Ashwin Kaushik
- Yuchuan Zhai

## Test Environment Setup
- run npm install in both front & backend folder terminals
- Done!

## Pre-Set Users
- Andrew Meads (admin)
  - username: andrewm
  - password: testpwd
- Yu-Cheng Tu (admin)
  - username: yuchengt
  - password: testpwd
- David Huang (admin)
  - username: davidh
  - password: testpwd
- Arjun Kaushik (not admin)
  - username: arjunk
  - password: testpwd

## API Documentation
- Endpoints & associated functions are split between blog-dao.js, api-blog.js, auth-middleware.js, and admin-api.js. The operations associated with blog post functions are located in api-blog.js and blog-dao.js while those which work with user profiles are
    located in admin-api.js
-   blog-dao.js: Database access layer to handle blog-related db operations
    - getPosts, getPostById, addPost, updatePost, deletePost, likePost, searchPosts, getmyposts
    - addComment, getCommentsForPost, updateComment, deleteComment
    - addBlogPostImage, updateBlogPostImage, getBlogPostImages, deleteBlogPostImage
-   api-blog.js: REST API routes for blog functionality
    - Multer - Image upload configuration for blog posts
    - POST /api/posts - Create new blog post
    - GET /api/posts - Get all posts
    - GET /api/posts/:id - Get individual post by ID
    - PUT /api/posts/:id - Update post by ID
    - DELETE /api/posts/:id - Delete post by ID
    - POST /api/posts/:id/like - Like/unlike post by ID
    - POST /api/posts/:id/comments - Add comment by PostId
    - PUT /api/posts/comments/:id - Edit comment by PostId
    - DELETE /api/posts/comments/:id - Delete comment by PostId
    - GET /api/posts/search - Search posts with sorting
    - GET /getmyposts - Get all posts written by authorized user
    - POST /api/posts/:id/image - Upload image file associated with PostId
    - GET /api/posts/:id/images - Get images associated with blog PostId
-   auth-middleware.js: Authentication middleware functions
    - authenticateUser - Verifies JWT Token as user for protected routes
    - authenticateAdmin - Verifies JWT Token as admin for specific admin route privileges
-   admin-api.js: Admin-Specific API Endpoints
    - Multer - Avatar upload configuration for user profiles
    - POST /api/login - User login with JWT Token
    - POST & GET /api/logout - Clears cookie associated with user authorization
    - POST /api/register - New user registration
    - GET /api/users - Lists all users (admin only)
    - PUT /api/users/:id - Update user profile
    - DELETE /api/users/:id - Delete user & associated data
    - POST /api/users/:id/avatar - Upload user avatar
    - GET /api/check-username/:username - Verifies if new username is valid or not
    - GET /api/user/profile - Get information for current user

## Page Description
- Home (/routes/+page.svelte)
  - Landing page; This contains the site introduction and displays a few articles to begin with
- Blog (/routes/blog)
  - List of all published articles; searchable and sortable
- Publish (/routes/newPost)
  - Displays list of all articles written by current user with options to edit and/or delete. Also has button to switch to "add" article page
- Add Article (/routes/add)
  - Allows user to create new article; Uses TinyMCE WYSIWYG editor & allows for image upload
- Post (/routes/post/[id])
  - Specific page to expand on articles; Displays image, title, content, and allows for commenting
- Login (/routes/login)
  - Login page; Prompts user for username and password. If not existing user, can redirect to 'Register' page
- User (/routes/user)
  - Displays user information, published blog posts, and option to edit profile or logout
- Create New User (/routes/register)
  - Register page; Prompts user for username, password, basic/required personal information, and avatar selection or upload
- Edit Profile (/routes/editUser)
  - Can update all user information (username, name, birthday, details, avatar, password)
- Edit Article (/routes/editArticle)
  - Can update article title/content, add/remove/change image, and uses TinyMCE editor

## Java Swing Instructions
- Run backend using VSCode
- Open IntelliJ & "java-client" folder
- Run Main.java file
- Log-in with Admin User
- Select user for expanded details

## Comments
- Andrew had allowed us to slightly modify the Swing component requirements as we are in a group of three rather than four. Specifically, we removed the delete button. 

![](./backend/public/images/Noble%20Nightingales.webp)
