import { gql } from 'graphql-tag'

export const typeDefs = gql`
  scalar DateTime
  scalar FileUpload

  type User {
    id: ID!
    email: String!
    name: String
    role: Role!
    createdAt: DateTime!
    updatedAt: DateTime!
    posts: [Post!]!
  }

  type Post {
    id: ID!
    title: String!
    slug: String!
    excerpt: String
    content: String!
    published: Boolean!
    publishedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    author: User!
    category: Category
    tags: [Tag!]!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
    posts: [Post!]!
    _count: CategoryCount!
  }

  type CategoryCount {
    posts: Int!
  }

  type Tag {
    id: ID!
    name: String!
    slug: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    posts: [Post!]!
    _count: TagCount!
  }

  type TagCount {
    posts: Int!
  }

  type Project {
    id: ID!
    title: String!
    slug: String!
    description: String!
    content: String
    technologies: [String!]!
    githubUrl: String
    liveUrl: String
    imageUrl: String
    featured: Boolean!
    published: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Resume {
    id: ID!
    data: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Upload {
    id: ID!
    filename: String!
    originalName: String!
    mimetype: String!
    encoding: String!
    url: String!
    size: Int!
    folder: String!
    uploadedBy: User!
    createdAt: DateTime!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  enum Role {
    USER
    ADMIN
  }

  input PostInput {
    title: String!
    slug: String!
    excerpt: String
    content: String!
    published: Boolean
    categoryId: String
    tagIds: [String!]
  }

  input PostUpdateInput {
    title: String
    slug: String
    excerpt: String
    content: String
    published: Boolean
    categoryId: String
    tagIds: [String!]
  }

  input CategoryInput {
    name: String!
    slug: String!
    description: String
  }

  input TagInput {
    name: String!
    slug: String!
  }

  input TagUpdateInput {
    name: String
    slug: String
  }

  input CategoryUpdateInput {
    name: String
    slug: String
    description: String
  }

  input ProjectInput {
    title: String!
    slug: String!
    description: String!
    content: String
    technologies: [String!]!
    githubUrl: String
    liveUrl: String
    imageUrl: String
    featured: Boolean
    published: Boolean
  }

  input ProjectUpdateInput {
    title: String
    slug: String
    description: String
    content: String
    technologies: [String!]
    githubUrl: String
    liveUrl: String
    imageUrl: String
    featured: Boolean
    published: Boolean
  }

  input PostsFilter {
    published: Boolean
    categoryId: String
    tagIds: [String!]
    search: String
  }

  input ProjectsFilter {
    published: Boolean
    featured: Boolean
    search: String
    technologies: [String!]
  }

  enum OrderDirection {
    asc
    desc
  }

  input PostOrderBy {
    createdAt: OrderDirection
    publishedAt: OrderDirection
    title: OrderDirection
  }

  input ProjectOrderBy {
    createdAt: OrderDirection
    title: OrderDirection
    featured: OrderDirection
  }

  input UploadOrderBy {
    createdAt: OrderDirection
    filename: OrderDirection
    size: OrderDirection
  }

  input ResumeInput {
    personalInfo: String!
    summary: String!
    experience: String!
    education: String!
    skills: String!
    projects: String!
    certifications: String
    languages: String
  }

  type Query {
    # 用户相关
    me: User
    
    # 博客相关
    posts(filter: PostsFilter, skip: Int, take: Int, orderBy: PostOrderBy): [Post!]!
    post(id: String, slug: String): Post
    postsCount(filter: PostsFilter): Int!
    
    # 分类和标签
    categories: [Category!]!
    category(id: String, slug: String): Category
    tags: [Tag!]!
    tag(id: String, slug: String): Tag
    
    # 项目相关
    projects(filter: ProjectsFilter, skip: Int, take: Int, orderBy: ProjectOrderBy): [Project!]!
    project(id: String, slug: String): Project
    projectsCount(filter: ProjectsFilter): Int!
    
    # 简历
    resume: Resume
    resumes(skip: Int, take: Int): [Resume!]!
    
    # 文件上传
    uploads(skip: Int, take: Int, folder: String, orderBy: UploadOrderBy): [Upload!]!
    upload(id: String!): Upload
  }

  type Mutation {
    # 认证
    login(email: String!, password: String!): AuthPayload!
    refreshToken(refreshToken: String!): AuthPayload!
    
    # 博客管理
    createPost(input: PostInput!): Post!
    updatePost(id: String!, input: PostUpdateInput!): Post!
    deletePost(id: String!): Boolean!
    
    # 分类管理
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: String!, input: CategoryUpdateInput!): Category!
    deleteCategory(id: String!): Boolean!
    
    # 标签管理
    createTag(input: TagInput!): Tag!
    updateTag(id: String!, input: TagUpdateInput!): Tag!
    deleteTag(id: String!): Boolean!
    
    # 项目管理
    createProject(input: ProjectInput!): Project!
    updateProject(id: String!, input: ProjectUpdateInput!): Project!
    deleteProject(id: String!): Boolean!
    
    # 简历管理
    createResume(input: ResumeInput!): Resume!
    updateResume(data: String!): Resume!
    deleteResume(id: String!): Boolean!
    
    # 文件上传
    uploadFile(file: FileUpload!, folder: String): Upload!
    deleteUpload(id: String!): Boolean!
  }
`