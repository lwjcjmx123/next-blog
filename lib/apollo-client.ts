import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

// 安全地访问环境变量
const getEnvVar = (key: string, defaultValue: string = "") => {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

const httpLink = createHttpLink({
  uri: getEnvVar(
    "NEXT_PUBLIC_GRAPHQL_ENDPOINT",
    "http://localhost:3000/api/graphql"
  ),
  credentials: "include", // 包含 cookies
});

const authLink = setContext((_, { headers }) => {
  // 从本地存储获取 token
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

        // 处理认证错误
        if (
          message.includes("Unauthorized") ||
          message.includes("Invalid token")
        ) {
          // 清除本地存储的认证信息
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("auth_user");

            // 如果在管理页面，跳转到登录页
            if (window.location.pathname.startsWith("/admin")) {
              window.location.href = "/admin/login";
            }
          }
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);

      // 处理网络错误
      if (networkError.message.includes("401")) {
        // 未授权错误
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth_user");

          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/admin/login";
          }
        }
      }
    }
  }
);

// 重试链接
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // 只重试网络错误，不重试 GraphQL 错误
      return !!error && !error.result;
    },
  },
});

// 内存缓存配置
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          // 合并分页结果
          keyArgs: ["where", "orderBy"],
          merge(existing = { edges: [], pageInfo: {} }, incoming) {
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          },
        },
        projects: {
          keyArgs: ["where", "orderBy"],
          merge(existing = { edges: [], pageInfo: {} }, incoming) {
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          },
        },
      },
    },
    Post: {
      fields: {
        tags: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
    Project: {
      fields: {
        technologies: {
          merge(existing, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

// 创建 Apollo Client
const client = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  connectToDevTools: getEnvVar("NODE_ENV") === "development",
});

export default client;

// 用于服务端渲染的客户端
export function createApolloClient() {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([errorLink, retryLink, httpLink]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        errorPolicy: "all",
      },
      query: {
        errorPolicy: "all",
      },
    },
  });
}
