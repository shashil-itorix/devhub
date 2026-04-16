// Ground-truth OpenAPI spec — the UI renders several of these fields incorrectly (intentional bugs)

export const SPEC = {
  info: { title: 'DevHub API', version: '2.0.0' },
  servers: {
    v1: 'https://api.devhub.io/v1',
    v2: 'https://api.devhub.io/v2',
  },
  endpoints: [
    {
      id: 'list-users',
      method: 'GET',
      // BUG 04: UI only renders 3 of 4 query params (drops "sort")
      path: '/users',
      summary: 'List all users',
      minVersion: 'v1',
      deprecated: false,
      parameters: [
        { name: 'page',   in: 'query', required: false, type: 'integer', description: 'Page number (default: 1)' },
        { name: 'limit',  in: 'query', required: false, type: 'integer', description: 'Results per page (default: 20)' },
        { name: 'status', in: 'query', required: false, type: 'string',  description: 'Filter by account status' },
        { name: 'sort',   in: 'query', required: false, type: 'string',  description: 'Sort field (name, created_at)' },
      ],
      responses: {
        200: [
          { field: 'users', type: 'array',   description: 'Array of user objects' },
          { field: 'total', type: 'integer', description: 'Total matching records' },
          { field: 'page',  type: 'integer', description: 'Current page number' },
        ],
      },
    },
    {
      id: 'get-user',
      method: 'GET',
      // BUG 03: UI renders this path as /users/{id} instead of /users/{userId}
      path: '/users/{userId}',
      summary: 'Get a single user by ID',
      minVersion: 'v1',
      deprecated: false,
      parameters: [
        { name: 'userId', in: 'path', required: true, type: 'string', description: 'Unique user identifier' },
      ],
      responses: {
        200: [
          // BUG 02: UI renders user_id type as "string" — spec says integer
          { field: 'user_id',    type: 'integer', description: 'Unique user identifier' },
          { field: 'name',       type: 'string',  description: 'Full display name' },
          { field: 'email',      type: 'string',  description: 'Primary email address' },
          { field: 'role',       type: 'string',  description: 'User role (admin, member, viewer)' },
          { field: 'created_at', type: 'string',  description: 'ISO 8601 creation timestamp' },
        ],
      },
    },
    {
      id: 'create-user',
      method: 'POST',
      path: '/users',
      summary: 'Create a new user account',
      minVersion: 'v1',
      deprecated: false,
      parameters: [
        // BUG 01: UI renders "name" required column as "No" — spec says required: true
        { name: 'name',  in: 'body', required: true,  type: 'string', description: 'Full display name' },
        { name: 'email', in: 'body', required: true,  type: 'string', description: 'Primary email address' },
        { name: 'role',  in: 'body', required: false, type: 'string', description: 'User role (default: member)' },
      ],
      responses: {
        201: [
          { field: 'user_id', type: 'integer', description: 'Newly created user ID' },
          { field: 'name',    type: 'string',  description: 'Full display name' },
          { field: 'email',   type: 'string',  description: 'Primary email address' },
        ],
      },
    },
    {
      id: 'list-posts',
      method: 'GET',
      path: '/posts',
      summary: 'List all published posts',
      minVersion: 'v1',
      deprecated: false,
      parameters: [
        { name: 'page',      in: 'query', required: false, type: 'integer', description: 'Page number' },
        { name: 'limit',     in: 'query', required: false, type: 'integer', description: 'Results per page' },
        { name: 'author_id', in: 'query', required: false, type: 'string',  description: 'Filter by author user ID' },
        { name: 'sort',      in: 'query', required: false, type: 'string',  description: 'Sort field (published_at, title)' },
      ],
      responses: {
        200: [
          { field: 'posts', type: 'array',   description: 'Array of post objects' },
          { field: 'total', type: 'integer', description: 'Total matching records' },
        ],
      },
    },
    {
      id: 'legacy-users',
      method: 'GET',
      path: '/api/v1/users',
      summary: 'List users — legacy endpoint',
      minVersion: 'v1',
      // BUG 07: UI never shows a Deprecated badge despite this being true
      deprecated: true,
      parameters: [],
      responses: {
        200: [
          { field: 'data',  type: 'array',   description: 'Array of user objects' },
          { field: 'count', type: 'integer', description: 'Total records returned' },
        ],
      },
    },
    // v2-only endpoints — BUG 19: sidebar shows these even when version switcher is set to v1
    {
      id: 'list-webhooks',
      method: 'GET',
      path: '/webhooks',
      summary: 'List all registered webhooks',
      minVersion: 'v2',
      deprecated: false,
      parameters: [
        { name: 'active', in: 'query', required: false, type: 'boolean', description: 'Filter by active status' },
      ],
      responses: {
        200: [
          { field: 'webhooks', type: 'array',   description: 'Array of webhook objects' },
          { field: 'total',    type: 'integer', description: 'Total webhook count' },
        ],
      },
    },
    {
      id: 'create-webhook',
      method: 'POST',
      path: '/webhooks',
      summary: 'Register a new webhook endpoint',
      minVersion: 'v2',
      deprecated: false,
      parameters: [
        { name: 'url',    in: 'body', required: true, type: 'string', description: 'HTTPS URL to receive events' },
        { name: 'events', in: 'body', required: true, type: 'array',  description: 'Event types to subscribe to' },
        { name: 'secret', in: 'body', required: false, type: 'string', description: 'HMAC signing secret' },
      ],
      responses: {
        201: [
          { field: 'id',      type: 'string',  description: 'Webhook UUID' },
          { field: 'url',     type: 'string',  description: 'Registered URL' },
          { field: 'active',  type: 'boolean', description: 'Whether webhook is active' },
        ],
      },
    },
  ],
}

// Version-scoped search index — BUG 12: SearchBar always queries v1 regardless of switcher
export const SEARCH_INDEX = {
  v1: [
    { title: 'GET /users',            excerpt: 'List all users with pagination and status filtering',          page: 'api-reference' },
    { title: 'GET /users/{userId}',   excerpt: 'Retrieve a single user by their unique identifier',           page: 'api-reference' },
    { title: 'POST /users',           excerpt: 'Create a new user account with name, email, and role',        page: 'api-reference' },
    { title: 'GET /posts',            excerpt: 'List published posts with author filtering and sorting',       page: 'api-reference' },
    { title: 'Authentication',        excerpt: 'Bearer token authentication required for all API endpoints',  page: 'api-reference' },
    { title: 'Rate Limiting',         excerpt: 'Requests are limited to 1 000 per hour per API token',        page: 'api-reference' },
    { title: 'Error Codes',           excerpt: '400 Bad Request, 401 Unauthorized, 404 Not Found, 429 Too Many Requests', page: 'api-reference' },
  ],
  v2: [
    { title: 'GET /users',            excerpt: 'List all users with advanced filtering, sorting, and cursor pagination', page: 'api-reference' },
    { title: 'GET /users/{userId}',   excerpt: 'Retrieve a single user by their unique identifier',                     page: 'api-reference' },
    { title: 'POST /users',           excerpt: 'Create a new user with role assignment and webhook triggers',            page: 'api-reference' },
    { title: 'GET /posts',            excerpt: 'List posts with full-text search and cursor pagination',                 page: 'api-reference' },
    { title: 'GET /webhooks',         excerpt: 'List all registered webhooks for your application',                     page: 'api-reference' },
    { title: 'POST /webhooks',        excerpt: 'Register a new HTTPS endpoint to receive real-time event notifications', page: 'api-reference' },
    { title: 'Authentication',        excerpt: 'OAuth 2.0 and Bearer token authentication supported in v2',              page: 'api-reference' },
    { title: 'Cursor Pagination',     excerpt: 'v2 uses cursor-based pagination for consistent results on large datasets', page: 'api-reference' },
    { title: 'Webhook Events',        excerpt: 'Subscribe to user.created, user.updated, post.published, and more',     page: 'api-reference' },
  ],
}
